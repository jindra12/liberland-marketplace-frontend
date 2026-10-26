import { ListIdentitiesDocument } from "../../generated/graphql";
import type {
    IdentityByIdQuery,
    IdentityByIdQueryVariables,
    ListIdentitiesQuery,
    ListIdentitiesQueryVariables,
} from "../../generated/graphql";
import { fetchListCompaniesByIdentity, fetchListJobsByIdentity, fetchListProductsByIdentity } from "../queries";
import { fetchServerQuery } from "../utils";
import { normalizePublicBackendUrl } from "../security/utils";
import { buildTribeListingMetadata, selectTribe } from "../../tribeSearch/utils";
import type { TribeListing, TribeReference, TribeSearchInput } from "../../tribeSearch/types";
import { TribeSearchError } from "../../tribeSearch/types";
import { matchesServiceQuery } from "./results/utils";
import { buildDetailUrl } from "../../detailMetadata/related";

const fetchTribes = async (
    serverUrl: string,
    page = 1,
): Promise<NonNullable<ListIdentitiesQuery["Identities"]>["docs"]> => {
    // Read identities directly: a backend's search index may be stale or unavailable.
    const result = await fetchServerQuery<ListIdentitiesQuery, ListIdentitiesQueryVariables>(
        ListIdentitiesDocument,
        { page, limit: 100 },
        serverUrl,
    );
    if (!result.Identities) {
        throw new Error("Backend omitted the tribes result.");
    }
    if (!result.Identities.hasNextPage) {
        return result.Identities.docs;
    }
    if (page >= 5) {
        throw new Error("Too many tribes for name lookup. Browse /tribes and repeat with tribeId.");
    }
    return [...result.Identities.docs, ...(await fetchTribes(serverUrl, page + 1))];
};

export const fetchListedTribe = async (
    variables: IdentityByIdQueryVariables,
    serverUrl = process.env.REACT_APP_BACKEND_URL,
): Promise<IdentityByIdQuery> => {
    if (!serverUrl) {
        throw new Error("REACT_APP_BACKEND_URL is required.");
    }
    const tribes = await fetchTribes(normalizePublicBackendUrl(serverUrl));
    return { Identity: tribes.find((tribe) => tribe.id === variables.id) };
};

const resolveTribe = async (input: TribeSearchInput, serverUrl: string): Promise<TribeReference> => {
    // Legacy tribes can be listed and filtered by ID even when their by-ID resolver fails.
    const tribes = await fetchTribes(serverUrl);
    if (input.tribeId) {
        const tribe = tribes.find((candidate) => candidate.id === input.tribeId);
        if (!tribe) {
            throw new TribeSearchError(404, "TRIBE_NOT_FOUND", `Tribe ${input.tribeId} was not found on ${serverUrl}.`);
        }
        return tribe;
    }
    return selectTribe(tribes, input.tribe!);
};

const fetchTribeListing = async (
    input: TribeSearchInput,
    tribeId: string,
    serverUrl: string,
): Promise<TribeListing> => {
    const variables = { identityId: tribeId, page: input.page, limit: input.limit, sort: "-contentRankScore" };
    switch (input.entity) {
        case "companies": {
            const result = await fetchListCompaniesByIdentity(variables, serverUrl);
            if (!result.Companies) {
                throw new Error("Backend omitted the tribe companies result.");
            }
            return result.Companies;
        }
        case "products": {
            const result = await fetchListProductsByIdentity(variables, serverUrl);
            if (!result.Products) {
                throw new Error("Backend omitted the tribe products result.");
            }
            return result.Products;
        }
        case "jobs": {
            const result = await fetchListJobsByIdentity(variables, serverUrl);
            if (!result.Jobs) {
                throw new Error("Backend omitted the tribe jobs result.");
            }
            return result.Jobs;
        }
    }
};

const fetchAllTribeListings = async (
    input: TribeSearchInput,
    tribeId: string,
    serverUrl: string,
    page = 1,
): Promise<TribeListing["docs"]> => {
    const listing = await fetchTribeListing({ ...input, page, limit: 100 }, tribeId, serverUrl);
    if (!listing.hasNextPage) {
        return listing.docs;
    }
    if (page >= 20) {
        throw new TribeSearchError(
            503,
            "SEARCH_TOO_LARGE",
            "Too many affiliated records for a complete text scan. Browse the paginated collection instead.",
        );
    }
    return [...listing.docs, ...(await fetchAllTribeListings(input, tribeId, serverUrl, page + 1))];
};

const fetchMatchingListing = async (
    input: TribeSearchInput,
    tribeId: string,
    serverUrl: string,
): Promise<TribeListing> => {
    const [items, products] = await Promise.all([
        fetchAllTribeListings(input, tribeId, serverUrl),
        input.entity === "companies" ? fetchAllTribeListings({ ...input, entity: "products" }, tribeId, serverUrl) : [],
    ]);
    const matches = items
        .map((item) => ({
            ...item,
            services: products
                .filter((product) => product.company?.id === item.id)
                .map((product) => ({
                    id: product.id,
                    name: product.name || "Product or service",
                    description: product.description || "",
                    url: buildDetailUrl("/products-services", product.id, product.serverURL || serverUrl),
                })),
        }))
        .filter((item) => matchesServiceQuery(item, input.q!));
    const offset = (input.page - 1) * input.limit;
    return {
        docs: matches.slice(offset, offset + input.limit),
        totalDocs: matches.length,
        hasNextPage: offset + input.limit < matches.length,
    };
};

export const fetchTribeSearchResult = async (input: TribeSearchInput) => {
    const configuredUrl = input.serverUrl || process.env.REACT_APP_BACKEND_URL;
    if (!configuredUrl) {
        throw new Error("REACT_APP_BACKEND_URL is required.");
    }
    const serverUrl = (() => {
        try {
            return normalizePublicBackendUrl(configuredUrl);
        } catch (error) {
            if (!input.serverUrl) {
                throw error;
            }
            throw new TribeSearchError(
                400,
                "INVALID_SOURCE",
                "serverUrl must identify a public HTTPS backend without credentials, query, or fragment.",
            );
        }
    })();
    const resolvedTribe = await resolveTribe(input, serverUrl);
    const tribe = { id: resolvedTribe.id, name: resolvedTribe.name };
    const listing = input.q
        ? await fetchMatchingListing(input, tribe.id, serverUrl)
        : await fetchTribeListing(input, tribe.id, serverUrl);
    return { input, tribe, serverUrl, listing };
};

export const fetchTribeSearchMetadata = async (input: TribeSearchInput) => {
    const result = await fetchTribeSearchResult(input);
    return buildTribeListingMetadata(input, result.tribe, result.serverUrl, result.listing);
};
