import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UploadSubmissionProbe } from "../support/security-regressions/UploadSubmissionProbe";
import { createEntityFormConfig, FixtureUploadFile } from "../support/security-regressions/entity/utils";

describe("Publication intent during media upload", { retries: 0 }, () => {
    const pendingUploads: Array<() => void> = [];
    afterEach(() => pendingUploads.splice(0).forEach((release) => release()));

    beforeEach(() => {
        const config = createEntityFormConfig();
        const gate = Promise.withResolvers<void>();
        pendingUploads.push(gate.resolve);
        cy.wrap(gate.resolve).as("releaseUpload");
        const started = cy.stub().as("uploadStarted");
        cy.intercept("POST", `${config.url}/api/media`, async (request) => {
            started();
            await gate.promise;
            request.reply({
                statusCode: 200,
                body: {
                    doc: {
                        id: "media-fixture",
                        url: "/api/media/file/fixture.png",
                        filename: "fixture.png",
                        mimeType: "image/png",
                    },
                },
            });
        }).as("pendingUpload");
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const file = new FixtureUploadFile(["fixture"], "fixture.png", { type: "image/png" });
        mount(
            <QueryClientProvider client={client}>
                <MemoryRouter>
                    <UploadSubmissionProbe
                        config={config}
                        file={{ uid: "fixture", name: file.name, originFileObj: file }}
                    />
                </MemoryRouter>
            </QueryClientProvider>,
        );
    });

    it("locks publication controls while the selected image is uploading", () => {
        cy.contains("button", "Publish").click();
        cy.get("@uploadStarted").should("have.been.calledOnce");
        cy.contains("button", "Publish").then(($publish) => {
            const publishDisabled = $publish.prop("disabled");
            cy.contains("button", "Save draft").then(($draft) => {
                const draftDisabled = $draft.prop("disabled");
                cy.get<() => void>("@releaseUpload").then((release) => release());
                cy.wait("@pendingUpload");
                cy.then(() => {
                    expect(publishDisabled, "publish control during upload").to.equal(true);
                    expect(draftDisabled, "draft control during upload").to.equal(true);
                });
            });
        });
    });

    it("retains the original publish intent when a draft action is attempted during upload", () => {
        cy.contains("button", "Publish").click();
        cy.get("@uploadStarted").should("have.been.calledOnce");
        // React ignores clicks on a genuinely disabled button; the faulty enabled button changes draftRef.
        cy.contains("button", "Save draft").click({ force: true });
        cy.get<() => void>("@releaseUpload").then((release) => release());
        cy.wait("@pendingUpload");
        cy.get("@createCompany").should("have.been.calledWithMatch", { draft: false });
    });
});
