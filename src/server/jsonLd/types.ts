export type JsonLdPageMetadata = {
    canonicalPath: string;
    jsonLd: Record<string, unknown>[];
};

export type JsonLdResponse = {
    getHeader: (name: string) => string | number | string[] | undefined;
    setHeader: (name: string, value: string) => void;
    end: (body?: string) => void;
};
