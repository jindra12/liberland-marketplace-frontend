import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoaderDraftProbe } from "../support/security-regressions/LoaderDraftProbe";

describe("Draft retention during background refresh", { retries: 0 }, () => {
    it("keeps unsaved input mounted when refreshing already loaded data fails", () => {
        const fetch = cy
            .stub()
            .onFirstCall()
            .resolves({ name: "Original name" })
            .onSecondCall()
            .rejects(new Error("Backend temporarily unavailable"));
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        mount(
            <QueryClientProvider client={client}>
                <LoaderDraftProbe fetch={fetch} />
            </QueryClientProvider>,
        );
        cy.get('input[aria-label="Draft name"]').clear().type("Unsaved edited name");
        cy.contains("button", "Refresh").click();
        cy.wrap(fetch).should("have.been.calledTwice");
        cy.wrap(client).should(() => {
            expect(client.getQueryState(["loader-draft-fixture"])?.status).to.equal("error");
        });
        cy.get('input[aria-label="Draft name"]').should("have.value", "Unsaved edited name");
    });
});
