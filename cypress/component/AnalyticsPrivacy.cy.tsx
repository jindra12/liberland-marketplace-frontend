import React from "react";
import { AnalyticsProvider } from "use-analytics";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mount } from "cypress/react";
import { AnalyticsMutationBridge } from "../../src/components/analytics/AnalyticsMutationBridge";
import { appAnalytics } from "../../src/components/analytics/analytics";
import { ANALYTICS_IDENTITIES_KEY } from "../../src/components/analytics/constants";
import { gqlFetcher } from "../../src/gqlFetcher";
import { CartBySecretDocument } from "../../src/generated/graphql";
import type { CartBySecretQuery, CartBySecretQueryVariables, TrackAnalyticsEventMutationVariables } from "../../src/generated/graphql";

describe("Source-scoped analytics privacy", { retries: 0 }, () => {
    it("isolates backend identifiers and removes checkout and GraphQL secrets from actual telemetry", () => {
        const first = "https://first-analytics.example";
        const second = "https://second-analytics.example";
        const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
        cy.spy(appAnalytics, "on").as("analyticsSubscriptions");
        const errors = cy.spy(console, "error");
        [first, second].forEach((source, index) => {
            cy.intercept("POST", `${source}/api/graphql`, (request) => {
                if (request.body.query.includes("query CartBySecret")) {
                    request.alias = "privateCartRead";
                    request.reply({ body: { data: { Carts: { totalDocs: 0, docs: [] } } } });
                    return;
                }
                request.alias = `analytics${index}`;
                expect(JSON.stringify(request.body)).not.to.contain("private-");
                request.reply({ body: { data: { trackAnalyticsEvent: {
                    success: true,
                    analytics: { distinctId: `visitor-${index}`, sessionId: `session-${index}` },
                } } } });
            });
        });
        mount(
            <QueryClientProvider client={client}>
                <AnalyticsProvider instance={appAnalytics}>
                    <AnalyticsMutationBridge />
                </AnalyticsProvider>
            </QueryClientProvider>,
        );
        cy.get("@analyticsSubscriptions").should("have.been.calledWith", "page");
        cy.then(async () => {
            await appAnalytics.page({ route: "/order?mcpCheckout=private-capability#private-fragment" }, { targetUrl: first });
        });
        cy.then(() => {
            expect(errors.getCalls().map((call) => call.args.map(String))).to.deep.equal([]);
        });
        cy.wait<{ variables: TrackAnalyticsEventMutationVariables }>("@analytics0").then((request) => {
            expect(request.request.body.variables.input.route).to.equal("/order");
        });
        cy.window().should((win) => {
            expect(JSON.parse(win.localStorage.getItem(ANALYTICS_IDENTITIES_KEY)!)[first].distinctId).to.equal("visitor-0");
        });

        cy.then(async () => {
            await appAnalytics.page({ route: "/auth/callback?code=private-code" }, { targetUrl: second });
        });
        cy.wait<{ variables: TrackAnalyticsEventMutationVariables }>("@analytics1").then((request) => {
            expect(request.request.body.variables.input.route).to.equal("/auth/callback");
            expect(request.request.body.variables.input.distinctId).to.equal(undefined);
            expect(request.request.body.variables.input.sessionId).to.equal(undefined);
        });
        cy.window().should((win) => {
            expect(JSON.parse(win.localStorage.getItem(ANALYTICS_IDENTITIES_KEY)!)[second].sessionId).to.equal("session-1");
        });

        cy.then(async () => {
            await appAnalytics.page({ route: "/companies" }, { targetUrl: first });
        });
        cy.wait<{ variables: TrackAnalyticsEventMutationVariables }>("@analytics0").then((request) => {
            expect(request.request.body.variables.input).to.include({ distinctId: "visitor-0", sessionId: "session-0" });
        });
        cy.then(async () => {
            await gqlFetcher<CartBySecretQuery, CartBySecretQueryVariables>(
                CartBySecretDocument, { secret: "private-cart-secret" }, undefined, first,
            )();
        });
        cy.wait<{ variables: TrackAnalyticsEventMutationVariables }>("@analytics0").then((request) => {
            expect(request.request.body.variables.input.type).to.equal("graphql.query");
            expect(JSON.stringify(request.request.body)).not.to.contain("private-cart-secret");
        });
    });
});
