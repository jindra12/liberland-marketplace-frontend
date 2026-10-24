import type { GetServerSideProps } from "next";
import { fetchCollectionPageMetadata } from "../collectionMetadata";
import { SEO_BY_ROUTE } from "../shellPage/seo";
import { buildCanonicalPath, parsePageNumber } from "../shellPage/utils";
import type { CollectionPageProps, CollectionRoute } from "./types";

export const createCollectionPageProps = (route: CollectionRoute): GetServerSideProps<CollectionPageProps> => {
    return async (context) => {
        const page = parsePageNumber(context.query.page) ?? 1;
        const canonicalPath = buildCanonicalPath(context.resolvedUrl || route, page);
        try {
            return { props: await fetchCollectionPageMetadata(route, canonicalPath, page) };
        } catch (error) {
            console.error(error);
            const seo = SEO_BY_ROUTE[route];
            return {
                props: {
                    title: page > 1 ? `${seo.title} - Page ${page}` : seo.title,
                    description: page > 1 ? `${seo.description} This is page ${page} of the listing.` : seo.description,
                    canonicalPath,
                    jsonLd: seo.buildJsonLd?.(canonicalPath, page) ?? [],
                    extraMetaTags: seo.keywords?.length ? [{ name: "keywords", content: seo.keywords.join(", ") }] : [],
                    extraLinks: [],
                },
            };
        }
    };
};
