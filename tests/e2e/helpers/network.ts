import { expect } from "@playwright/test";
import type { Request } from "@playwright/test";

import type { GraphqlBody, GraphqlVariables, JsonObject, JsonValue } from "../servers/types";
import { toOperationName } from "../servers/utils";

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

export const createRequestRecorder = () => {
    const requests: RecordedRequest[] = [];
    const graphqlRequests: RecordedGraphqlRequest[] = [];

    const recordRequest = (request: Request) => {
        const record = {
            method: request.method(),
            postData: request.postData(),
            url: request.url(),
        };
        requests.push(record);

        if (!request.url().includes("/api/graphql") || request.method() !== "POST") {
            return;
        }

        const body = request.postDataJSON() as GraphqlBody;
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

export const expectGraphqlRequest = async (
    graphqlRequests: RecordedGraphqlRequest[],
    operationName: string,
    match?: (request: RecordedGraphqlRequest) => boolean,
) => {
    let request = graphqlRequests.find((candidate) => {
        const matchesOperationName =
            candidate.operationName === operationName || candidate.query.includes(operationName);

        return matchesOperationName && (match ? match(candidate) : true);
    });

    await expect.poll(
        () => {
            request = graphqlRequests.find((candidate) => {
                const matchesOperationName =
                    candidate.operationName === operationName || candidate.query.includes(operationName);

                return matchesOperationName && (match ? match(candidate) : true);
            });

            return Boolean(request);
        },
        {
            timeout: 60000,
        },
    ).toBeTruthy();

    expect(request, `Expected GraphQL request ${operationName}`).toBeTruthy();
    return request;
};
