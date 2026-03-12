import * as React from "react";
import Head from "next/head";

type AppHeadProps = {
    title?: string;
    description?: string;
};

const DEFAULT_TITLE = "NSwap";
const DEFAULT_DESCRIPTION = "Network marketplace for all your needs";
const DEFAULT_PREVIEW_IMAGE = "/preview-image.png";
const DEFAULT_URL = "https://liberland-marketplace-frontend.vercel.app";

export const AppHead: React.FunctionComponent<AppHeadProps> = ({
    title,
    description,
}) => {
    const titleValue = title || DEFAULT_TITLE;
    const descriptionValue = description || DEFAULT_DESCRIPTION;

    return (
        <Head>
            <meta charSet="utf-8" />
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="theme-color" content="#000000" />
            <meta name="description" content={descriptionValue} />
            <meta property="og:title" content={titleValue} />
            <meta property="og:description" content={descriptionValue} />
            <meta property="og:image" content={DEFAULT_PREVIEW_IMAGE} />
            <meta property="og:url" content={DEFAULT_URL} />
            <meta property="og:type" content="website" />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={titleValue} />
            <meta name="twitter:description" content={descriptionValue} />
            <meta name="twitter:image" content={DEFAULT_PREVIEW_IMAGE} />
            <link rel="apple-touch-icon" href="/logo192.png" />
            <link rel="manifest" href="/manifest.json" />
            <title>{titleValue}</title>
        </Head>
    );
};
