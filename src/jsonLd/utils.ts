import serialize from "serialize-javascript";

export const serializeJsonLd = (entry: Record<string, unknown>): string => {
    return serialize(entry, { isJSON: true });
};
