import { buildDetailUrl } from "../../../detailMetadata/related";
import { SITE_URL } from "../../../siteUrl";
import { TRIBE_COLLECTIONS } from "../../../tribeSearch/constants";
import type { TribeListingItem, TribeSearchResult } from "../../../tribeSearch/types";
import { TribeSearchError } from "../../../tribeSearch/types";

export const matchesServiceQuery = (item: TribeListingItem, query: string): boolean => {
    const words =
        `${item.name || item.title || ""} ${item.description || ""} ${(item.services || []).map((service) => `${service.name} ${service.description}`).join(" ")}`
            .toLocaleLowerCase()
            .match(/[\p{L}\p{N}]+/gu) || [];
    const terms = query.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
    return (
        terms.length > 0 &&
        terms.every((term) =>
            words.some(
                (word) => word === term || (term === "web" && ["website", "websites", "frontend"].includes(word)),
            ),
        )
    );
};

export const buildTribeJsonResponse = (result: TribeSearchResult) => {
    const pageUrl = (page: number) => {
        const url = new URL("/api/search/tribe", SITE_URL);
        Object.entries({
            entity: result.input.entity,
            tribeId: result.tribe.id,
            serverUrl: result.serverUrl,
            page: String(page),
            limit: String(result.input.limit),
            format: "json",
            ...(result.input.q ? { q: result.input.q } : {}),
        }).forEach(([key, value]) => url.searchParams.set(key, value));
        return url.href;
    };
    return {
        entity: result.input.entity,
        tribe: { ...result.tribe, url: buildDetailUrl("/tribes", result.tribe.id, result.serverUrl) },
        serverUrl: result.serverUrl,
        affiliationSemantics:
            "Primary company tribe relationship, not a claim of physical location or legal incorporation.",
        affiliationEvidence: {
            field: result.input.entity === "companies" ? "identity" : "companyIdentityId",
            equals: result.tribe.id,
            source: result.serverUrl,
            method: "Backend relationship-filtered GraphQL query; never description keyword matching.",
        },
        query: result.input.q || "",
        docs: result.listing.docs.map((item) => ({
            id: item.id,
            name: item.name || item.title,
            description: item.description || "",
            url: buildDetailUrl(
                TRIBE_COLLECTIONS[result.input.entity].path,
                item.id,
                item.serverURL || result.serverUrl,
            ),
            serverUrl: item.serverURL || result.serverUrl,
            tribe: result.tribe,
            website: item.website,
            services: item.services || [],
        })),
        totalDocs: result.listing.totalDocs,
        page: result.input.page,
        limit: result.input.limit,
        totalPages: Math.ceil(result.listing.totalDocs / result.input.limit),
        hasNextPage: result.listing.hasNextPage,
        links: {
            self: pageUrl(result.input.page),
            next: result.listing.hasNextPage ? pageUrl(result.input.page + 1) : null,
            previous: result.input.page > 1 ? pageUrl(result.input.page - 1) : null,
        },
    };
};

export const tribeSearchFailure = (error: unknown) => {
    if (error instanceof TribeSearchError) {
        return { status: error.status, body: { code: error.code, error: error.message } };
    }
    return {
        status: 502,
        body: {
            code: "BACKEND_SEARCH_FAILED",
            error: "The source backend could not complete the search. This is not an empty result.",
        },
    };
};
