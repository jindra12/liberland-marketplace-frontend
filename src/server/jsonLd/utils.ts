import type { GetServerSideProps } from "next";
import { buildJsonLdAlternateUrl, serializeJsonLd } from "../../jsonLd/utils";
import { JSON_LD_MEDIA_TYPE } from "../../jsonLd/constants";
import { SITE_URL } from "../../siteUrl";
import { SEO_BY_ROUTE } from "../../shellPage/seo";
import type { CollectionPageProps } from "../types";
import type { JsonLdPageMetadata, JsonLdResponse } from "./types";

export const jsonLdPageResponse = <T extends JsonLdPageMetadata>(
    metadata: T,
    query: Record<string, string | string[] | undefined>,
    response: JsonLdResponse,
) => {
    const jsonLdAlternateUrl = buildJsonLdAlternateUrl(metadata.canonicalPath);
    const current = response.getHeader("Link");
    const existing = Array.isArray(current) ? current.join(", ") : typeof current === "string" ? current : "";
    response.setHeader("Link", [existing, `<${jsonLdAlternateUrl}>; rel="alternate"; type="${JSON_LD_MEDIA_TYPE}"`].filter(Boolean).join(", "));
    if (query.format === "jsonld") {
        response.setHeader("Content-Type", `${JSON_LD_MEDIA_TYPE}; charset=utf-8`);
        response.setHeader("Content-Location", jsonLdAlternateUrl);
        response.setHeader("X-Content-Type-Options", "nosniff");
        response.setHeader("Content-Security-Policy", "default-src 'none'");
        response.setHeader("Cache-Control", "public, max-age=60, stale-if-error=300");
        response.setHeader("Link", [existing, `<${new URL(metadata.canonicalPath, SITE_URL).href}>; rel="canonical"`].filter(Boolean).join(", "));
        response.end(serializeJsonLd({ "@context": "https://schema.org", "@graph": metadata.jsonLd }));
    }
    // Next requires JSON-safe props, including optional fields inside structured data.
    const props: T & { jsonLdAlternateUrl: string; readableOnly: boolean } = JSON.parse(serializeJsonLd({ ...metadata, jsonLdAlternateUrl, readableOnly: query.format === "html" }));
    return { props };
};

export const createPublicShellPageProps = (route: "/" | "/syndication"): GetServerSideProps<CollectionPageProps> => {
    return async (context) => {
        const seo = SEO_BY_ROUTE[route];
        return jsonLdPageResponse({
            title: seo.title,
            description: seo.description,
            canonicalPath: route,
            jsonLd: seo.buildJsonLd?.(route) || [],
            extraMetaTags: seo.keywords?.length ? [{ name: "keywords", content: seo.keywords.join(", ") }] : [],
            extraLinks: [],
        }, context.query, context.res);
    };
};
