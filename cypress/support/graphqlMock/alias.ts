import objectHash from "object-hash";

const toAliasSegment = (value: string): string => value.replace(/[^a-zA-Z0-9]+/g, "_");

export const normalizeGraphQLHost = (requestUrl: string): string => {
    const url = new URL(requestUrl);
    const host = url.hostname === "localhost" ? "127.0.0.1" : url.hostname;
    return `${host}:${url.port}`;
};

export const buildGraphQLAlias = (
    requestUrl: string,
    operationName: string,
    variables: Record<string, unknown> | undefined = undefined,
): string => {
    const variablesHash = objectHash(variables ?? {}, {
        unorderedObjects: true,
        unorderedArrays: false,
        respectType: true,
    });

    return `gql_${toAliasSegment(normalizeGraphQLHost(requestUrl))}_${toAliasSegment(operationName)}_${variablesHash}`;
};
