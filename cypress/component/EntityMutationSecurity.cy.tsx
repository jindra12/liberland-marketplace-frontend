import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EntityFormProbe } from "../support/security-regressions/EntityFormProbe";
import { createEntityFormConfig } from "../support/security-regressions/entity/utils";
import { ResponseProvenanceProbe } from "../support/security-regressions/ResponseProvenanceProbe";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { BACKEND_URL } from "../../src/gqlFetcher";
import { useUpdateCommentContentMutation } from "../../src/components/hooks";
import { withResponseSource } from "../../src/components/query/provenanceUtils";

describe("Source-bound entity mutations", { retries: 0 }, () => {
    it("normalizes arbitrary nested JSON immutably without rewriting ordinary links or scalars", () => {
        const input = Object.freeze({
            record: Object.freeze({ id: 0, serverURL: MAIN_SERVER_URL, serverUrl: null }),
            values: Object.freeze([null, false, 7, "keep this text"]),
            nested: Object.freeze({
                metadata: Object.freeze({ serverUrl: MAIN_SERVER_URL }),
                url: `${MAIN_SERVER_URL}/asset`,
            }),
        });
        const result = withResponseSource(input, COOP_SERVER_URL);
        expect(result.record).to.deep.equal({ id: 0, serverURL: COOP_SERVER_URL, serverUrl: COOP_SERVER_URL });
        expect(result.nested.metadata.serverUrl).to.equal(COOP_SERVER_URL);
        expect(result.nested.url).to.equal(input.nested.url);
        expect(result.values).to.deep.equal(input.values);
        expect(input.record.serverURL).to.equal(MAIN_SERVER_URL);
        expect(input.record.serverUrl).to.equal(null);
        expect(result.record).not.to.equal(input.record);
    });
    const forgedComment = {
        id: "shared-comment",
        content: `A plain mention of ${MAIN_SERVER_URL} must stay unchanged.`,
        serverUrl: MAIN_SERVER_URL,
        serverURL: MAIN_SERVER_URL,
        company: {
            id: "company",
            name: "Remote company",
            serverURL: MAIN_SERVER_URL,
            image: { id: "media", url: `${MAIN_SERVER_URL}/public-image.png`, serverUrl: MAIN_SERVER_URL },
        },
        replyComment: [{ id: "reply", serverUrl: MAIN_SERVER_URL }],
    };

    it("binds detail and mutation responses, nested relations and success callbacks to the requested backend", () => {
        const saved = cy.spy();
        cy.intercept<{ query: string }>("POST", `${COOP_SERVER_URL}/api/graphql`, (request) => {
            request.reply({
                data: request.body.query.includes("mutation UpdateCommentContent")
                    ? { updateComment: forgedComment }
                    : { Comment: forgedComment },
            });
        });
        mountPublicFederatedList(<ResponseProvenanceProbe serverUrl={COOP_SERVER_URL} onSaved={saved} />);
        cy.get('[data-cy="detail-provenance"]').should(($result) => {
            const data: { Comment: typeof forgedComment } = JSON.parse($result.text());
            expect(data.Comment.serverUrl).to.equal(COOP_SERVER_URL);
            expect(data.Comment.serverURL).to.equal(COOP_SERVER_URL);
            expect(data.Comment.company.image.serverUrl).to.equal(COOP_SERVER_URL);
            expect(data.Comment.replyComment[0].serverUrl).to.equal(COOP_SERVER_URL);
            expect(data.Comment.content).to.equal(forgedComment.content);
            expect(data.Comment.company.image.url).to.equal(forgedComment.company.image.url);
        });
        cy.contains("button", "Save source-bound comment").click();
        cy.get('[data-cy="mutation-provenance"]').should(($result) => {
            const data: { updateComment: typeof forgedComment } = JSON.parse($result.text());
            expect(data.updateComment.serverUrl).to.equal(COOP_SERVER_URL);
            expect(data.updateComment.company.serverURL).to.equal(COOP_SERVER_URL);
            expect(data.updateComment.company.image.serverUrl).to.equal(COOP_SERVER_URL);
        });
        cy.wrap(saved).should("have.been.calledOnce");
        cy.then(() => expect(saved.firstCall.args[0].updateComment.company.serverURL).to.equal(COOP_SERVER_URL));
    });

    [COOP_SERVER_URL, undefined].forEach((serverUrl) => {
        it(`protects the standalone mutation fetcher using ${serverUrl ? "the explicit" : "the default"} backend`, () => {
            const source = serverUrl || BACKEND_URL;
            cy.intercept("POST", `${source}/api/graphql`, {
                data: {
                    updateComment: {
                        ...forgedComment,
                        serverUrl: "https://forged.example",
                        serverURL: "https://forged.example",
                        company: { ...forgedComment.company, serverURL: "https://forged.example" },
                    },
                },
            }).as("sourceBoundMutation");
            cy.then(async () => {
                const data = await useUpdateCommentContentMutation.fetcher({
                    id: "shared-comment",
                    company: "company",
                    content: "Edited",
                    url: serverUrl,
                })();
                expect(data.updateComment?.company?.serverURL).to.equal(source);
            });
            cy.wait("@sourceBoundMutation").its("request.body.variables").should("not.have.property", "url");
        });
    });
    it("refreshes related company views after saving without invalidating other sources or entities", () => {
        const client = new QueryClient();
        const config = createEntityFormConfig();
        const affected = ["ListCompanies", "ListCompaniesByIdentity", "SearchCompanies", "CompanyById"];
        const unrelated = [
            ["ListCompanies", { page: 1 }, "https://another-market.example"],
            ["ListJobs", { page: 1 }, config.url],
        ];
        affected.forEach((operation) =>
            client.setQueryData([operation, { page: 1 }, config.url], { name: "Old name" }),
        );
        unrelated.forEach((key) => client.setQueryData(key, { name: "Unrelated data" }));
        mount(
            <QueryClientProvider client={client}>
                <MemoryRouter>
                    <EntityFormProbe config={config} />
                </MemoryRouter>
            </QueryClientProvider>,
        );
        cy.contains("button", "Save company").click();
        cy.get("@createCompany").should("have.been.calledOnce");
        cy.wrap(client).should(() => {
            affected.forEach((operation) => {
                expect(client.getQueryState([operation, { page: 1 }, config.url])?.isInvalidated, operation).to.equal(
                    true,
                );
            });
            unrelated.forEach((key) => {
                expect(client.getQueryState(key)?.isInvalidated, String(key[0])).to.equal(false);
            });
        });
    });
});
