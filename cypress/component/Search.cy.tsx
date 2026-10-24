import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";

import { AntProvider } from "../../src/components/AntProvider";
import { JobSearch } from "../../src/components/search/JobSearch";
import {
    ListJobsDocument,
    SearchJobsDocument,
    Search_Doc_RelationTo,
    Post_RelatedPosts_RelationTo,
} from "../../src/generated/graphql";
import type { ListJobsQuery, SearchJobsQuery, SearchJobsQueryVariables } from "../../src/generated/graphql";
import { TEXT_INPUT_MAX_LENGTH } from "../../src/components/form/constants";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { TestEndpointContextProvider } from "../support/component-tests/testEndpointContext";

describe("job search component", () => {
    beforeEach(() => {
        cy.viewport(1280, 900);
        const jobs: NonNullable<ListJobsQuery["Jobs"]>["docs"] = [
            { __typename: "Job", id: "job-developer", title: "Frontend developer", description: "Build marketplace interfaces.", serverURL: MAIN_SERVER_URL },
            { __typename: "Job", id: "job-designer", title: "Product designer", description: "Design accessible marketplace experiences.", serverURL: MAIN_SERVER_URL },
        ];
        const page = { page: 1, limit: 5, totalPages: 1, hasNextPage: false, hasPrevPage: false };
        const onSearch = cy.stub().as("searchRequest");

        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            const body = request.body as { query: string; variables: SearchJobsQueryVariables };
            if (body.query === ListJobsDocument) {
                request.alias = "initialJobs";
                const data: ListJobsQuery = { Jobs: { ...page, totalDocs: jobs.length, docs: jobs } };
                request.reply({ body: { data } });
            }
            if (body.query === SearchJobsDocument) {
                onSearch(body.variables);
                request.alias = "searchedJobs";
                const matches = jobs.filter((job) => job.title?.toLowerCase().includes(body.variables.searchTerm.toLowerCase()));
                const data: SearchJobsQuery = {
                    Searches: {
                        ...page,
                        totalDocs: matches.length,
                        docs: matches.map((job) => ({
                            id: `search-${job.id}`,
                            title: job.title,
                            doc: { relationTo: Search_Doc_RelationTo.Jobs, value: job },
                        })),
                    },
                };
                request.reply({ body: { data } });
            }
        });

        mount(
            <AntProvider>
                <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
                    <TestEndpointContextProvider>
                        <MemoryRouter>
                            <JobSearch onClose={cy.stub().as("close")} onSelect={cy.stub().as("select")} />
                        </MemoryRouter>
                    </TestEndpointContextProvider>
                </QueryClientProvider>
            </AntProvider>,
        );
        cy.wait("@initialJobs");
        cy.get(".SearchDrawer .ant-list-item").should("have.length", 2);
    });

    it("submits the entered query, renders matching jobs, and reports the selected job", () => {
        cy.get('input[placeholder="Search jobs"]').type("developer");
        cy.get("@searchRequest").should("not.have.been.called");
        cy.contains("button", /^Search$/).click();
        cy.wait("@searchedJobs").its("request.body.variables").should("include", { searchTerm: "developer", page: 1, limit: 5 });

        cy.get(".SearchDrawer .ant-list-item").should("have.length", 1).and("contain.text", "Frontend developer");
        cy.get(".SearchDrawer").should("not.contain.text", "Product designer");
        cy.screenshot("search-matching-jobs", { capture: "viewport" });
        cy.contains("button", /^Select$/).click();
        cy.get("@select").should("have.been.calledOnceWithExactly", {
            relationTo: Post_RelatedPosts_RelationTo.Jobs,
            value: "job-developer",
            label: "Frontend developer",
        });
        cy.get("@close").should("have.been.calledOnce");
    });

    it("shows an empty state when there are no matching jobs", () => {
        cy.get('input[placeholder="Search jobs"]').type("unmatched{enter}");
        cy.wait("@searchedJobs");
        cy.contains("No matching jobs").should("be.visible");
        cy.get(".SearchDrawer .ant-list-item").should("not.exist");
        cy.get("@select").should("not.have.been.called");
        cy.screenshot("search-no-matches", { capture: "viewport" });
    });

    it("validates empty and overlong queries without sending search requests", () => {
        cy.contains("button", /^Search$/).click();
        cy.contains("Search is required").should("be.visible");
        cy.get('input[placeholder="Search jobs"]').type("x".repeat(TEXT_INPUT_MAX_LENGTH + 1));
        cy.contains("button", /^Search$/).click();
        cy.contains(`Maximum ${TEXT_INPUT_MAX_LENGTH} characters`).should("be.visible");
        cy.get('input[placeholder="Search jobs"]').should("have.value", "x".repeat(TEXT_INPUT_MAX_LENGTH + 1));
        cy.get("@searchRequest").should("not.have.been.called");
        cy.screenshot("search-invalid-query", { capture: "viewport" });
    });
});
