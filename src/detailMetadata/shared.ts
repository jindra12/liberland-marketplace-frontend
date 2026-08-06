import { stripMarkdownToText } from "../components/publish/postForm/utils";
import { SITE_URL } from "../siteUrl";

export const SITE_NAME = "NSwap";
export { SITE_URL };

export const normalizeWhitespace = (value: string): string => {
    return value.replace(/\s+/g, " ");
};

export const buildExcerpt = (value: string, maxLength: number): string => {
    return normalizeWhitespace(stripMarkdownToText(value).replace(/<[^>]+>/g, " ")).slice(0, maxLength);
};

export const buildActionSentence = (actions: string[]): string => {
    return `On this page you can ${actions.join(", ")}.`;
};

export const buildAbsoluteImageUrl = (value: string | null | undefined): string | undefined => {
    if (!value) {
        return undefined;
    }

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    return value.startsWith("/") ? `${SITE_URL}${value}` : `${SITE_URL}/${value}`;
};

export const ensureSiteSuffix = (value: string): string => {
    if (value.endsWith(` | ${SITE_NAME}`) || value.endsWith(` ${SITE_NAME}`)) {
        return value;
    }

    return `${value} | ${SITE_NAME}`;
};

export const buildDetailJsonLd = (
    sectionName: string,
    sectionPath: string,
    detailLabel: string,
    description: string,
    canonicalPath: string,
    extraJsonLd: Record<string, unknown>[] = [],
): Record<string, unknown>[] => {
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: ensureSiteSuffix(detailLabel),
            url: `${SITE_URL}${canonicalPath}`,
            description,
            isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
            },
            mainEntityOfPage: `${SITE_URL}${canonicalPath}`,
            potentialAction: {
                "@type": "ReadAction",
                target: `${SITE_URL}${canonicalPath}`,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: sectionName,
                    item: `${SITE_URL}${sectionPath}`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: detailLabel,
                    item: `${SITE_URL}${canonicalPath}`,
                },
            ],
        },
        ...extraJsonLd,
    ];
};

const decodeHexSegment = (value: string): string => {
    if (!value || value.length % 2 !== 0 || !/^[0-9a-fA-F]+$/.test(value)) {
        return "";
    }

    const bytes = value.match(/.{1,2}/g);
    if (!bytes) {
        return "";
    }

    return bytes.map((segment) => String.fromCharCode(Number.parseInt(segment, 16))).join("");
};

export type DetailPageMetadata = {
    title: string;
    description: string;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
    imageUrl?: string;
    imageAlt?: string;
    ogType?: string;
    extraMetaTags?: Array<{
        content: string;
        name?: string;
        property?: string;
    }>;
};

export type DetailPageMetadataExtras = {
    imageUrl?: string;
    imageAlt?: string;
    ogType?: string;
    extraMetaTags?: Array<{
        content: string;
        name?: string;
        property?: string;
    }>;
};

export const decodeServerUrlSegment = (value: string): string => {
    return decodeHexSegment(value);
};

export const buildStandardDetailMetadata = (
    sectionName: string,
    sectionPath: string,
    detailLabel: string,
    description: string,
    canonicalPath: string,
    extraJsonLd: Record<string, unknown>[] = [],
    extras: DetailPageMetadataExtras = {},
): DetailPageMetadata => {
    return {
        title: ensureSiteSuffix(detailLabel),
        description,
        canonicalPath,
        jsonLd: buildDetailJsonLd(sectionName, sectionPath, detailLabel, description, canonicalPath, extraJsonLd),
        imageUrl: extras.imageUrl,
        imageAlt: extras.imageAlt,
        ogType: extras.ogType,
        extraMetaTags: extras.extraMetaTags,
    };
};
