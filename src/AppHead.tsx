import * as React from "react";
import Head from "next/head";
type AppHeadProps = {
    title?: string;
    description?: string;
    canonicalPath?: string;
    noIndex?: boolean;
    jsonLd?: Record<string, unknown>[];
    siteUrl?: string;
};
const DEFAULT_TITLE = "NSwap";
const DEFAULT_DESCRIPTION = "Network marketplace for all your needs";
const DEFAULT_PREVIEW_IMAGE = "/preview-image.png";
const DEFAULT_URL = "https://nswap.io";
export const AppHead: React.FunctionComponent<AppHeadProps> = (props) => {
    const titleValue = props.title || DEFAULT_TITLE;
    const descriptionValue = props.description || DEFAULT_DESCRIPTION;
    const resolvedSiteUrl = props.siteUrl || DEFAULT_URL;
    const canonicalUrl = props.canonicalPath ? `${resolvedSiteUrl}${props.canonicalPath}` : undefined;
    const robotsValue = props.noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large";
    return (
        <Head>
            <meta charSet="utf-8" />
            <link rel="icon" href="/favicon.ico" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="robots" content={robotsValue} />
            <meta name="description" content={descriptionValue} />
            <meta property="og:title" content={titleValue} />
            <meta property="og:description" content={descriptionValue} />
            <meta property="og:image" content={DEFAULT_PREVIEW_IMAGE} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={titleValue} />
            <meta name="twitter:description" content={descriptionValue} />
            <meta name="twitter:image" content={DEFAULT_PREVIEW_IMAGE} />
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>{titleValue}</title>
            {(props.jsonLd || []).map((entry, index) => (
                <script
                    key={`jsonld-${index}`}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(entry),
                    }}
                />
            ))}
        </Head>
    );
};
