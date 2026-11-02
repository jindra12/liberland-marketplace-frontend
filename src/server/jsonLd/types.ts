import type { PublicPageContent } from "../../aiDiscovery/types";

export type JsonLdPageMetadata = {
    title?: string;
    description?: string;
    content?: PublicPageContent;
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
};

export type JsonLdResponse = {
    getHeader: (name: string) => string | number | string[] | undefined;
    setHeader: (name: string, value: string) => void;
    end: (body?: string) => void;
};
