import { callBackendTool, parseBackendToolResult } from "../backend";
import { buildTribeListingMetadata, selectTribe, tribeSearchSchema } from "../../tribeSearch/utils";
import type { TribeListing, TribeReference, TribeSearchInput } from "../../tribeSearch/types";

export const findBackendEntitiesByTribe = async (
    input: TribeSearchInput,
    serverUrl: string,
    signal: AbortSignal,
) => {
    tribeSearchSchema.parse(input);
    const tribe = await resolveBackendTribe(input, serverUrl, signal);
    const affiliation = input.entity === "companies" ? "identity" : "companyIdentityId";
    // This discovery tool always reads anonymously, so backend access rules restrict it
    // to published records even when the gateway caller can also read private drafts.
    const result = parseBackendToolResult<TribeListing>(await callBackendTool(serverUrl, undefined, "list_entities", {
        entity: input.entity,
        page: input.page,
        limit: input.limit,
        where: { AND: [
            { [affiliation]: { equals: tribe.id } },
            ...(input.entity === "companies" ? [{ isPrivate: { equals: false } }] : []),
        ] },
    }, signal));
    const metadata = buildTribeListingMetadata(input, tribe, serverUrl, result);
    return { tribe, ...result, url: metadata.jsonLd[0].url, pagination: metadata.extraLinks, jsonLd: metadata.jsonLd };
};

const resolveBackendTribe = async (
    input: TribeSearchInput,
    serverUrl: string,
    signal: AbortSignal,
): Promise<TribeReference> => {
    if (input.tribeId) {
        const tribe = parseBackendToolResult<TribeReference | null>(await callBackendTool(serverUrl, undefined, "get_entity", {
            entity: "identities", id: input.tribeId,
        }, signal));
        if (!tribe) {
            throw new Error(`Tribe ${input.tribeId} was not found on ${serverUrl}.`);
        }
        return tribe;
    }
    const result = parseBackendToolResult<{ docs: TribeReference[]; hasNextPage: boolean }>(
        await callBackendTool(serverUrl, undefined, "list_entities", {
            entity: "identities", page: 1, limit: 100, where: { name: { like: input.tribe } },
        }, signal),
    );
    if (result.hasNextPage) {
        throw new Error("Too many matching tribes. Repeat with tribeId.");
    }
    return selectTribe(result.docs, input.tribe!);
};
