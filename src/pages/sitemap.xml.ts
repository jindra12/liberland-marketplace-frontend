import type { GetServerSideProps } from "next";

import { ListCompaniesDocument, ListIdentitiesDocument, ListProductsDocument } from "../generated/graphql";
import { BACKEND_URL } from "../gqlFetcher";
import { buildDetailUrl } from "../detailMetadata/related";
import { SITE_URL } from "../siteUrl";

const INDEXABLE_PATHS = ["/", "/jobs", "/companies", "/products-services", "/posts", "/tribes", "/ventures"];

type SitemapDoc = { id: string; serverURL?: string | null };
type SitemapPage = { docs: SitemapDoc[]; hasNextPage: boolean; nextPage?: number | null };
type SitemapData = { Companies?: SitemapPage; Identities?: SitemapPage; Products?: SitemapPage };
type SitemapResponse = { data?: SitemapData; errors?: Array<{ message: string }> };

const fetchSitemapPage = async (query: string, collection: keyof SitemapData, page: number): Promise<SitemapPage> => {
    const response = await fetch(`${BACKEND_URL}/api/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            query,
            variables: { page, limit: 100, sort: "-contentRankScore" },
        }),
    });

    if (!response.ok) {
        throw new Error(`Sitemap query failed with status ${response.status}`);
    }

    const payload = (await response.json()) as SitemapResponse;
    if (payload.errors?.length) {
        throw new Error(payload.errors[0].message);
    }

    return payload.data?.[collection] ?? { docs: [], hasNextPage: false };
};

const fetchAllSitemapUrls = async (
    query: string,
    collection: keyof SitemapData,
    page = 1,
    urls: string[] = [],
): Promise<string[]> => {
    const result = await fetchSitemapPage(query, collection, page);
    const pageUrls = result.docs.map((doc) => {
        const serverUrl = doc.serverURL || BACKEND_URL;
        const sectionPath = collection === "Companies" ? "/companies" : collection === "Products" ? "/products-services" : "/tribes";
        return buildDetailUrl(sectionPath, doc.id, serverUrl);
    });
    const nextUrls = [...urls, ...pageUrls];

    if (!result.hasNextPage) {
        return nextUrls;
    }

    return fetchAllSitemapUrls(query, collection, result.nextPage ?? page + 1, nextUrls);
};

const escapeXml = (value: string): string =>
    value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const buildSitemapXml = (generatedAtIso: string, detailUrls: string[]): string => {
    const entries = [...INDEXABLE_PATHS.map((path) => {
        const loc = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
        const priority = path === "/" ? "1.0" : "0.8";

        return `
  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${generatedAtIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }), ...detailUrls.map((url) => `
  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${generatedAtIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`)]
        .join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`;
};

const SitemapXml = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    let detailUrls: string[] = [];

    try {
        const urlsByCollection = await Promise.all([
            fetchAllSitemapUrls(ListCompaniesDocument, "Companies"),
            fetchAllSitemapUrls(ListProductsDocument, "Products"),
            fetchAllSitemapUrls(ListIdentitiesDocument, "Identities"),
        ]);
        detailUrls = Array.from(new Set(urlsByCollection.flat()));
    } catch (error) {
        console.error(error);
    }

    const xml = buildSitemapXml(new Date().toISOString(), detailUrls);

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.write(xml);
    res.end();

    return {
        props: {},
    };
};

export default SitemapXml;
