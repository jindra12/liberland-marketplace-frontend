import type { GetServerSideProps } from "next";

const SITE_URL = "https://nswap.io";

const INDEXABLE_PATHS = ["/", "/jobs", "/companies", "/products-services", "/tribes", "/ventures"];

const buildSitemapXml = (generatedAtIso: string): string => {
    const entries = INDEXABLE_PATHS.map((path) => {
        const loc = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
        const priority = path === "/" ? "1.0" : "0.8";

        return `
  <url>
    <loc>${loc}</loc>
    <lastmod>${generatedAtIso}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${priority}</priority>
  </url>`;
    }).join("");

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`;
};

const SitemapXml = () => null;

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    const xml = buildSitemapXml(new Date().toISOString());

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
    res.write(xml);
    res.end();

    return {
        props: {},
    };
};

export default SitemapXml;
