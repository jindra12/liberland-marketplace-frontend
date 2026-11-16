import type { GraphQLServerResponse } from "./server/types";

/** Guest checkout must not send saved access tokens or browser session cookies. */
export const publicGqlFetcher = async <TData, TVariables extends object>(
    query: string,
    variables: TVariables,
    serverUrl: string,
): Promise<TData> => {
    const response = await fetch(`${serverUrl}/api/graphql`, {
        method: "POST",
        credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
    });
    const payload: GraphQLServerResponse<TData> = await response.json();
    if (payload.errors?.length) {
        throw new Error(payload.errors.map((error) => error.message).join("\n"));
    }
    if (!response.ok || !payload.data) {
        throw new Error(`GraphQL request failed with status ${response.status}.`);
    }
    return payload.data;
};
