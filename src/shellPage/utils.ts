import { SITE_URL } from "../siteUrl";

export const normalizePath = (path: string): string => {
    if (!path) {
        return "/";
    }

    const withoutQuery = path.split("?")[0].split("#")[0] || "/";
    return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
};

export const parsePageNumber = (value: string | string[] | null | undefined): number | undefined => {
    const rawValue = Array.isArray(value) ? value[0] : value;

    if (!rawValue) {
        return undefined;
    }

    const parsedValue = Number.parseInt(rawValue, 10);
    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        return undefined;
    }

    return parsedValue;
};

export const appendPageQuery = (canonicalPath: string, pageNumber: number): string => {
    if (pageNumber <= 1) {
        return canonicalPath;
    }

    return `${canonicalPath}?page=${pageNumber}`;
};

export const buildCanonicalPath = (asPath: string, pageNumber?: number): string => {
    const resolvedUrl = new URL(asPath || "/", `${SITE_URL}/`);
    const path = normalizePath(resolvedUrl.pathname);

    if (pageNumber !== undefined && pageNumber > 1) {
        return appendPageQuery(path, pageNumber);
    }

    return path;
};
