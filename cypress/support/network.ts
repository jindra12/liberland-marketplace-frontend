import type { GraphqlBody, GraphqlVariables, JsonObject, JsonValue } from "../../tests/ct/servers/types";
import { toOperationName } from "../../tests/ct/servers/utils";

const NETWORK_TIMEOUT_MS = 20000;

export type RecordedRequest = {
    method: string;
    postData: string | null;
    url: string;
};

export type RecordedGraphqlRequest = RecordedRequest & {
    operationName: string;
    query: string;
    variables: GraphqlVariables;
};

type RecordedRequestLike = {
    body?: GraphqlBody | string | null;
    method: string;
    url: string;
};

export const createRequestRecorder = () => {
    const requests: RecordedRequest[] = [];
    const graphqlRequests: RecordedGraphqlRequest[] = [];

    const recordRequest = (request: RecordedRequestLike) => {
        const record = {
            method: request.method,
            postData: JSON.stringify(request.body ?? null),
            url: request.url,
        } satisfies RecordedRequest;
        requests.push(record);

        if (!request.url.includes("/api/graphql") || request.method !== "POST") {
            return;
        }

        const body = (request.body ?? {}) as GraphqlBody;
        const query = typeof body.query === "string" ? body.query : "";
        const operationName = toOperationName(body) ?? "";

        graphqlRequests.push({
            ...record,
            operationName,
            query,
            variables: body.variables ?? {},
        });
    };

    return {
        graphqlRequests,
        recordRequest,
        requests,
    };
};

export const isJsonObject = (value: JsonValue | undefined): value is JsonObject => {
    return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const expectGraphqlRequest = (
    graphqlRequests: RecordedGraphqlRequest[],
    operationName: string,
    match?: (request: RecordedGraphqlRequest) => boolean,
) => {
    console.log("[ct] waiting for GraphQL request " + operationName);

    cy.wrap(null).should(() => {
        const request = graphqlRequests.find((candidate) => {
            const matchesOperationName = candidate.operationName === operationName || candidate.query.includes(operationName);
            return matchesOperationName && (match ? match(candidate) : true);
        });

        expect(request, "Expected GraphQL request " + operationName).to.exist;
    });

    console.log("[ct] matched GraphQL request " + operationName);
};
