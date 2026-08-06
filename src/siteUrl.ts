const normalizeSiteUrl = (value: string): string => {
    return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const getSiteUrl = (): string => {
    const siteUrl = process.env.REACT_APP_BASE_URL;

    if (!siteUrl) {
        throw new Error("REACT_APP_BASE_URL is required");
    }

    return normalizeSiteUrl(siteUrl);
};

export const SITE_URL = getSiteUrl();

export const buildSiteUrl = (path: string): string => {
    return new URL(path || "/", `${SITE_URL}/`).toString().replace(/\/$/, "");
};
