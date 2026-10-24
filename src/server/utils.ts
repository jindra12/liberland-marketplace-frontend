import { normalizePublicBackendUrl, publicBackendFetch } from "./security/utils";
import type { GraphQLServerResponse } from "./types";

export const fetchServerQuery = async <TData, TVariables extends object | undefined>(
    query: string,
    variables: TVariables,
    serverUrl = process.env.REACT_APP_BACKEND_URL,
    requestHeaders?: HeadersInit,
): Promise<TData> => {
    if (!serverUrl) {
        throw new Error("REACT_APP_BACKEND_URL is required for server-side GraphQL requests.");
    }

    const headers = new Headers(requestHeaders);
    headers.set("Content-Type", "application/json");
    const response = await publicBackendFetch(`${normalizePublicBackendUrl(serverUrl)}/api/graphql`, {
        method: "POST",
        headers,
        body: JSON.stringify({ query, variables }),
    });
    if (!response.ok) {
        throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const payload = await response.json() as GraphQLServerResponse<TData>;
    if (payload.errors?.length) {
        throw new Error(payload.errors[0].message);
    }
    if (!payload.data) {
        throw new Error("Missing GraphQL data");
    }
    return payload.data;
};

export const createServerQueryFetcher = <TData, TVariables extends object | undefined>(query: string) => {
    return (variables: TVariables, serverUrl?: string, headers?: HeadersInit): Promise<TData> => {
        return fetchServerQuery<TData, TVariables>(query, variables, serverUrl, headers);
    };
};
