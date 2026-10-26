import serialize from "serialize-javascript";
import { SITE_URL } from "../siteUrl";

export const buildJsonLdAlternateUrl = (canonicalPath: string): string => {
    const url = new URL(canonicalPath, SITE_URL);
    url.searchParams.set("format", "jsonld");
    return url.href;
};

export const serializeJsonLd = (entry: Record<string, unknown>): string => {
    return serialize(entry, { isJSON: true });
};
