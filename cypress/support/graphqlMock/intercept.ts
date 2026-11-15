import { getOperationAST, parse } from "graphql";
import type { HttpRequestInterceptor } from "cypress/types/net-stubbing";

export const interceptGraphQLOperation = <TVariables extends object>(
    operationName: string,
    handler: HttpRequestInterceptor<{ query: string; variables: TVariables }>,
) =>
    cy.intercept<{ query: string; variables: TVariables }>("POST", "**/api/graphql", (request) => {
        if (getOperationAST(parse(request.body.query))?.name?.value === operationName) {
            return handler(request);
        }
    });
