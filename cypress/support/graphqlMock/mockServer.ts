import { GraphQLScalarType, valueFromASTUntyped } from "graphql";
import { GraphQLHandler } from "graphql-mocks";
import { cypressHandler } from "@graphql-mocks/network-cypress";

import { buildGraphQLAlias, normalizeGraphQLHost } from "./alias";
import { recordGraphQLRequestLog } from "./requestLogs";
import { graphqlSchema } from "./schema";
import { mutationResolvers, queryResolvers } from "./resolvers";
import { nowIso, graphQLFixturesForHost, type GraphQLRequestBody } from "./runtimeState";
import { searchResponseFor } from "./responseHelpers";

const scalar = (name: string) =>
    new GraphQLScalarType({
        name,
        serialize: (value) => value,
        parseValue: (value) => value,
        parseLiteral: (ast) => valueFromASTUntyped(ast),
    });

const mockScalarMap = [
    "JSON",
    "AnalyticsTrackInput",
    "Comment_ReplyPostRelationshipInput",
    "mutationCartInput",
    "mutationCartUpdateInput",
    "mutationCompanyInput",
    "mutationCompanyUpdateInput",
    "mutationJobInput",
    "mutationJobUpdateInput",
    "mutationPostInput",
    "mutationPostUpdateInput",
    "mutationOrderInput",
    "mutationOrderUpdateInput",
    "mutationReportInput",
    "mutationProductInput",
    "mutationProductUpdateInput",
    "mutationStartupInput",
    "mutationStartupUpdateInput",
    "mutationUserUpdateInput",
].reduce<Record<string, GraphQLScalarType>>((accumulator, name) => {
    accumulator[name] = scalar(name);
    return accumulator;
}, {});

const toRequestBody = (body: GraphQLRequestBody): Record<string, unknown> => ({
    ...body,
});

const getOperationName = (body: GraphQLRequestBody): string => {
    if (body.operationName) {
        return body.operationName;
    }

    const match = body.query?.match(/\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/);
    return match?.[2] || "anonymous";
};

const graphqlHandler = new GraphQLHandler({
    dependencies: {
        graphqlSchema,
    },
    scalarMap: mockScalarMap,
    resolverMap: {
        Query: queryResolvers as Record<string, (...args: any[]) => any>,
        Mutation: mutationResolvers as Record<string, (...args: any[]) => any>,
    },
});

export const installGraphQLMock = () => {
    const handler = cypressHandler(graphqlHandler);

    cy.intercept("OPTIONS", /http:\/\/127\.0\.0\.1:301[0-2]\/api\/graphql$/, (req) => {
        const origin = typeof req.headers.origin === "string" ? req.headers.origin : "*";
        const host = new globalThis.URL(req.url).host;
        const requestLog = {
            timestamp: nowIso(),
            method: "OPTIONS" as const,
            url: req.url,
            host,
            responseStatusCode: 204,
        };

        req.reply({
            statusCode: 204,
            headers: {
                "access-control-allow-origin": origin,
                "access-control-allow-methods": "POST, OPTIONS",
                "access-control-allow-headers": "content-type, authorization, x-requested-with",
                "access-control-max-age": "86400",
            },
        });

        recordGraphQLRequestLog(requestLog);
    });

    cy.intercept("POST", /http:\/\/127\.0\.0\.1:301[0-2]\/api\/graphql$/, async (req) => {
        const body = req.body as GraphQLRequestBody;
        const operationName = getOperationName(body);
        const host = normalizeGraphQLHost(req.url);
        graphQLFixturesForHost(host);
        req.alias = buildGraphQLAlias(req.url, operationName, body.variables as Record<string, unknown> | undefined);

        if (operationName.startsWith("Search")) {
            const responseBody = {
                data: {
                    Searches: searchResponseFor(operationName, body),
                },
            };
            recordGraphQLRequestLog({
                timestamp: nowIso(),
                method: "POST",
                url: req.url,
                host,
                operationName,
                alias: req.alias,
                requestBody: toRequestBody(body),
                responseStatusCode: 200,
                responseBody,
            });
            req.reply({
                statusCode: 200,
                body: responseBody,
            });
            return;
        }

        await handler(req);
        const response = req as unknown as { response?: { statusCode?: number; body?: Record<string, unknown> } };
        recordGraphQLRequestLog({
            timestamp: nowIso(),
            method: "POST",
            url: req.url,
            host,
            operationName,
            alias: req.alias,
            requestBody: toRequestBody(body),
            responseStatusCode: response.response?.statusCode || 200,
            responseBody: response.response?.body,
        });
    });
};
