import { SITE_URL } from "../siteUrl";
import { z } from "zod";

export const isWebsiteUrl = (value: string): boolean => z.httpUrl().safeParse(value).success;

export const readablePageUrl = (href: string, readableOnly?: boolean): string => {
    if (!readableOnly) {
        return href;
    }
    const url = new URL(href, SITE_URL);
    if (url.origin !== SITE_URL) {
        return href;
    }
    url.searchParams.set("format", "html");
    return url.href;
};
