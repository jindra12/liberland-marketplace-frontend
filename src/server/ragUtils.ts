import {
    SemanticSearchDocument,
    type SemanticSearchQuery,
    type SemanticSearchQueryVariables,
} from "../generated/graphql";
import { fetchServerQuery } from "./utils";

export const queryBackendRag = async (
    serverUrl: string,
    query: string,
    limit?: number,
    headers?: HeadersInit,
    signal?: AbortSignal,
) => {
    const result = await fetchServerQuery<SemanticSearchQuery, SemanticSearchQueryVariables>(
        SemanticSearchDocument,
        { query, limit },
        serverUrl,
        headers,
        signal,
    );
    return result.semanticSearch;
};
