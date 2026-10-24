export const serializeJsonLd = (entry: Record<string, unknown>): string => {
    return JSON.stringify(entry).replace(/</g, "\\u003c");
};
