import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createEntityFormConfig, FixtureUploadFile } from "../support/security-regressions/entity/utils";
import { PublicationFailureProbe } from "../support/security-regressions/PublicationFailureProbe";

describe("Publication failure handling", { retries: 0 }, () => {
    it("handles a failed upload within the same error boundary as publication", () => {
        const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
        const config = createEntityFormConfig();
        const escaped = cy.stub().as("escapedUploadFailure");
        const file = new FixtureUploadFile(["fixture"], "fixture.png", { type: "image/png" });
        cy.intercept("POST", `${config.url}/api/media`, { statusCode: 503, body: { error: "Upload unavailable" } });
        mount(
            <QueryClientProvider client={client}>
                <MemoryRouter>
                    <PublicationFailureProbe
                        config={config}
                        file={{ uid: "fixture", name: file.name, originFileObj: file }}
                        onEscapedFailure={escaped}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );
        cy.contains("button", "Publish").click();
        cy.get('[data-cy="publication-state"]').should("have.text", "settled");
        cy.get("@createCompany").should("not.have.been.called");
        cy.get("@escapedUploadFailure").should("not.have.been.called");
    });
});
