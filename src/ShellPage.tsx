import * as React from "react";

import { useRouter } from "next/router";

import { AppHead } from "./AppHead";
import { Dynamic } from "./Dynamic";
import { SITE_URL } from "./shellPage/constants";
import { DEFAULT_SEO, SEO_BY_ROUTE } from "./shellPage/seo";
import {
    appendPageQuery,
    buildCanonicalPath,
    normalizePath,
    parsePageNumber,
} from "./shellPage/utils";

const ShellPage: React.FunctionComponent = () => {
    const router = useRouter();
    const seo = SEO_BY_ROUTE[router.pathname] || DEFAULT_SEO;
    const pageNumber = seo.paginate ? parsePageNumber(router.query.page) : undefined;
    const canonicalPath = buildCanonicalPath(router.asPath || "/", pageNumber);

    const headTitle = pageNumber !== undefined && pageNumber > 1 ? `${seo.title} - Page ${pageNumber}` : seo.title;
    const headDescription =
        pageNumber !== undefined && pageNumber > 1
            ? `${seo.description} This is page ${pageNumber} of the listing.`
            : seo.description;
    const extraMetaTags = [
        ...(seo.keywords && seo.keywords.length > 0 ? [{ name: "keywords", content: seo.keywords.join(", ") }] : []),
    ];
    const extraLinks =
        seo.paginate && canonicalPath
            ? pageNumber !== undefined && pageNumber > 1
                ? [
                      {
                          rel: "prev",
                          href: `${SITE_URL}${appendPageQuery(normalizePath(canonicalPath), pageNumber - 1)}`,
                      },
                      {
                          rel: "next",
                          href: `${SITE_URL}${appendPageQuery(normalizePath(canonicalPath), pageNumber + 1)}`,
                      },
                  ]
                : [
                      {
                          rel: "next",
                          href: `${SITE_URL}${appendPageQuery(normalizePath(canonicalPath), 2)}`,
                      },
                  ]
            : [];

    return (
        <>
            <AppHead
                title={headTitle}
                description={headDescription}
                canonicalPath={canonicalPath}
                noIndex={seo.noIndex}
                siteUrl={SITE_URL}
                jsonLd={canonicalPath ? seo.buildJsonLd?.(canonicalPath, pageNumber) : undefined}
                extraMetaTags={extraMetaTags}
                extraLinks={extraLinks}
            />
            <Dynamic />
        </>
    );
};

export default ShellPage;
