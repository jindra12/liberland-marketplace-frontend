import * as React from "react";

import type { GetServerSideProps, GetServerSidePropsContext } from "next";

import { AppHead } from "./AppHead";
import { Dynamic } from "./Dynamic";
import { fetchCollectionPageMetadata } from "./collectionMetadata";
import { SEO_BY_ROUTE } from "./shellPage/seo";
import { buildCanonicalPath, parsePageNumber } from "./shellPage/utils";

type CollectionRoute = "/companies" | "/tribes" | "/jobs" | "/products-services" | "/ventures" | "/posts";

type CollectionPageProps = {
    title: string;
    description: string;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
    extraMetaTags: Array<{ name?: string; property?: string; content: string }>;
    extraLinks: Array<{ href: string; rel: string }>;
};

const getPageNumber = (context: GetServerSidePropsContext): number => {
    return parsePageNumber(context.query.page) ?? 1;
};

export const createCollectionPage = (route: CollectionRoute) => {
    const getServerSideProps: GetServerSideProps<CollectionPageProps> = async (context) => {
        const page = getPageNumber(context);
        const canonicalPath = buildCanonicalPath(context.resolvedUrl || route, page);

        try {
            return {
                props: await fetchCollectionPageMetadata(route, canonicalPath, page),
            };
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

    const CollectionPage: React.FunctionComponent<CollectionPageProps> = (props) => {
        return (
            <>
                <AppHead
                    title={props.title}
                    description={props.description}
                    canonicalPath={props.canonicalPath}
                    jsonLd={props.jsonLd}
                    extraMetaTags={props.extraMetaTags}
                    extraLinks={props.extraLinks}
                />
                <Dynamic />
            </>
        );
    };

    return { getServerSideProps, CollectionPage };
};
