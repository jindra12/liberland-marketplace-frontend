import { decodeServerUrlSegment } from "../../routes";

const toPathname = (value: string): string => {
    if (value.startsWith("http://") || value.startsWith("https://")) {
        try {
            return new globalThis.URL(value).pathname;
        } catch {
            return value;
        }
    }

    return value.split("?")[0].split("#")[0];
};

export const getReportContentKey = (value: string): string => {
    const segments = toPathname(value).split("/").filter(Boolean);
    return segments[1] || "";
};

export const getReportServerURL = (value: string): string => {
    const segments = toPathname(value).split("/").filter(Boolean);
    const encodedServerSegment = segments[segments.length - 1] || "";
    return decodeServerUrlSegment(encodedServerSegment);
};

export const isReportedContent = (reportedLinks: string[] | null | undefined, contentLink: string): boolean => {
    const contentKey = getReportContentKey(contentLink);

    if (!contentKey) {
        return false;
    }

    return (reportedLinks || []).some((link) => getReportContentKey(link) === contentKey);
};
