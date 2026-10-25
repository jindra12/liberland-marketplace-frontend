import { ListIdentitiesDocument } from "../../generated/graphql";
import type { ListIdentitiesQuery, ListIdentitiesQueryVariables } from "../../generated/graphql";
import { fetchIdentityById, fetchListCompaniesByIdentity, fetchListJobsByIdentity, fetchListProductsByIdentity } from "../queries";
import { fetchServerQuery } from "../utils";
import { normalizePublicBackendUrl } from "../security/utils";
import { buildTribeListingMetadata, selectTribe } from "../../tribeSearch/utils";
import type { TribeListing, TribeReference, TribeSearchInput } from "../../tribeSearch/types";

const fetchTribes = async (serverUrl: string, page = 1): Promise<TribeReference[]> => {
    // Read identities directly: a backend's search index may be stale or unavailable.
    const result = await fetchServerQuery<ListIdentitiesQuery, ListIdentitiesQueryVariables>(
        ListIdentitiesDocument, { page, limit: 100 }, serverUrl,
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
    return [...result.Identities.docs, ...await fetchTribes(serverUrl, page + 1)];
};

const resolveTribe = async (input: TribeSearchInput, serverUrl: string): Promise<TribeReference> => {
    if (input.tribeId) {
        const result = await fetchIdentityById({ id: input.tribeId }, serverUrl);
        if (!result.Identity) {
            throw new Error(`Tribe ${input.tribeId} was not found on ${serverUrl}.`);
        }
        return result.Identity;
    }
    return selectTribe(await fetchTribes(serverUrl), input.tribe!);
};

const fetchTribeListing = async (input: TribeSearchInput, tribeId: string, serverUrl: string): Promise<TribeListing> => {
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

export const fetchTribeSearchMetadata = async (input: TribeSearchInput) => {
    const configuredUrl = input.serverUrl || process.env.REACT_APP_BACKEND_URL;
    if (!configuredUrl) {
        throw new Error("REACT_APP_BACKEND_URL is required.");
    }
    const serverUrl = normalizePublicBackendUrl(configuredUrl);
    const tribe = await resolveTribe(input, serverUrl);
    const listing = await fetchTribeListing(input, tribe.id, serverUrl);
    return buildTribeListingMetadata(input, tribe, serverUrl, listing);
};
