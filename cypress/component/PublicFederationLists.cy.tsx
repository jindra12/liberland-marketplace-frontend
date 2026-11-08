import React from "react";
import { PostList } from "../../src/components/lists/PostList";
import { IdentityList } from "../../src/components/lists/IdentityList";
import { encodeServerUrlSegment } from "../../src/routes";
import type { ListIdentitiesQuery, ListPostsQuery } from "../../src/generated/graphql";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { CompanyList } from "../../src/components/lists/CompanyList";

describe("Public federated list boundaries", { retries: 0 }, () => {
    it("keeps a tribe filter specific to the chosen backend when two backends reuse its ID", () => {
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            const main = url === MAIN_SERVER_URL;
            cy.intercept<{ query: string }>("POST", `${url}/api/graphql`, (request) => {
                if (request.body.query.includes("query SearchIdentities")) {
                    request.reply({
                        data: {
                            Searches: {
                                docs: [
                                    {
                                        id: "search",
                                        title: main ? "Main tribe" : "Remote tribe",
                                        doc: {
                                            relationTo: "identities",
                                            value: { id: "shared-tribe", name: "Tribe", serverURL: main ? COOP_SERVER_URL : MAIN_SERVER_URL },
                                        },
                                    },
                                ],
                                hasNextPage: false,
                            },
                        },
                    });
                    return;
                }
                request.reply({
                    data: {
                        Companies: {
                            docs: [
                                {
                                    id: "shared-company",
                                    name: main ? "Main company" : "Remote company",
                                    serverURL: url,
                                    identity: { id: "shared-tribe", name: main ? "Main tribe" : "Remote tribe" },
                                },
                            ],
                            hasNextPage: false,
                        },
                    },
                });
            });
        });
        mountPublicFederatedList(<CompanyList />);
        cy.contains("a", "Main company").should("exist");
        cy.contains("a", "Remote company").should("exist");
        cy.get(".FilterControl .ant-select-selector").click();
        cy.get(".FilterControl input").should(($input) => {
            expect($input).not.to.have.attr("readonly");
        }).type("Tribe");
        cy.contains(".ant-select-item-option", "Remote tribe").should("be.visible");
        cy.contains(".ant-select-item-option", "Main tribe").click();
        cy.contains("a", "Main company").should("exist");
        cy.contains("a", "Remote company").should("not.exist");
        cy.contains("a.EntityDetail__identity", "Main tribe").should(
            "have.attr",
            "href",
            `/tribes/shared-tribe/${encodeServerUrlSegment(MAIN_SERVER_URL)}`,
        );
    });

    it("binds company profile links to the responding backend instead of a forged record source", () => {
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept("POST", `${url}/api/graphql`, {
                data: {
                    Companies: {
                        docs: [
                            {
                                id: "shared-company",
                                name: `Company from ${url}`,
                                serverURL: url === MAIN_SERVER_URL ? COOP_SERVER_URL : MAIN_SERVER_URL,
                            },
                        ],
                        hasNextPage: false,
                        totalDocs: 1,
                    },
                },
            });
        });
        mountPublicFederatedList(<CompanyList />);
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.contains("a", `Company from ${url}`).should(
                "have.attr",
                "href",
                `/companies/shared-company/${encodeServerUrlSegment(url)}`,
            );
        });
    });

    it("can continue past a filtered-out page without losing previous matching companies", () => {
        cy.intercept("POST", `${COOP_SERVER_URL}/api/graphql`, {
            data: { Companies: { docs: [], hasNextPage: false } },
        });
        cy.intercept<{ variables: { page: number } }>("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            const page = request.body.variables.page;
            request.alias = `companyPage${page}`;
            request.reply({
                data: {
                    Companies: {
                        docs: [
                            {
                                id: `company-${page}`,
                                name: `Company page ${page}`,
                                serverURL: MAIN_SERVER_URL,
                                identity: { id: page === 2 ? "unrelated" : "selected", name: "Tribe" },
                            },
                        ],
                        hasNextPage: page < 3,
                        totalDocs: 3,
                        page,
                    },
                },
            });
        });
        mountPublicFederatedList(<CompanyList />, undefined, { route: "/companies?tribe=selected" });
        cy.wait("@companyPage1");
        cy.contains("a", "Company page 1").should("exist");
        cy.contains("button", "Load more").click();
        cy.wait("@companyPage2");
        cy.contains("a", "Company page 2").should("not.exist");
        cy.contains("button", "Load more").click();
        cy.wait("@companyPage3");
        cy.contains("a", "Company page 1").should("exist");
        cy.contains("a", "Company page 3").should("exist");
        cy.contains("button", "Load more").should("not.exist");
    });

    it("keeps identical backend-local post IDs separate while accumulating and refreshing later pages", () => {
        cy.viewport(900, 250);
        const exhaustedSource = cy.stub().as("exhaustedPostSource");
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept<{ variables: { page: number } }>("POST", `${url}/api/graphql`, (request) => {
                const page = request.body.variables.page;
                const main = url === MAIN_SERVER_URL;
                if (!main && page > 1) {
                    exhaustedSource();
                }
                const data: ListPostsQuery = {
                    Posts: {
                        totalDocs: main ? 4 : 2,
                        limit: 2,
                        totalPages: main ? 2 : 1,
                        page,
                        hasPrevPage: page > 1,
                        docs: [
                            {
                                id: "shared-post",
                                title: main
                                    ? page === 1
                                        ? "Main first post"
                                        : "Main refreshed post"
                                    : "Remote first post",
                                content: "A syndicated marketplace post.",
                                company: { id: "company", name: "Company", serverURL: url },
                            },
                            {
                                id: `${main ? "main" : "remote"}-${page}`,
                                title: `Additional ${main ? "main" : "remote"} post ${page}`,
                                content: "More marketplace content.",
                                company: { id: "company", name: "Company", serverURL: url },
                            },
                        ],
                        hasNextPage: main && page === 1,
                    },
                };
                request.alias = page === 1 ? "postPageOne" : "postPageTwo";
                request.reply({ body: { data } });
            });
        });
        mountPublicFederatedList(<PostList />);
        cy.wait(["@postPageOne", "@postPageOne"]);
        cy.contains("a", "Main first post").should(
            "have.attr",
            "href",
            `/posts/shared-post/${encodeServerUrlSegment(MAIN_SERVER_URL)}`,
        );
        cy.contains("a", "Remote first post").should(
            "have.attr",
            "href",
            `/posts/shared-post/${encodeServerUrlSegment(COOP_SERVER_URL)}`,
        );
        cy.scrollTo("bottom");
        cy.wait("@postPageTwo");
        cy.contains("a", "Main refreshed post").should("exist");
        cy.contains("a", "Remote first post").should("exist");
        cy.contains("a", "Additional main post 1").should("exist");
        cy.contains("a", "Additional main post 2").should("exist");
        cy.get("@exhaustedPostSource").should("not.have.been.called");
    });

    it("loads the remaining tribe page without discarding earlier tribes or querying an exhausted backend", () => {
        const exhaustedSource = cy.stub().as("exhaustedTribeSource");
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept<{ variables: { page: number } }>("POST", `${url}/api/graphql`, (request) => {
                const page = request.body.variables.page;
                const main = url === MAIN_SERVER_URL;
                if (!main && page > 1) {
                    exhaustedSource();
                }
                const data: ListIdentitiesQuery = {
                    Identities: {
                        docs: main
                            ? Array.from({ length: page === 1 ? 20 : 1 }, (_, index) => ({
                                  id: `tribe-${(page - 1) * 20 + index}`,
                                  name: `Public tribe ${(page - 1) * 20 + index}`,
                                  serverURL: url,
                              }))
                            : [],
                        totalDocs: main ? 21 : 0,
                        limit: 20,
                        page,
                        totalPages: main ? 2 : 1,
                        hasPrevPage: page > 1,
                        hasNextPage: main && page === 1,
                    },
                };
                request.alias = page === 1 ? "tribePageOne" : "tribePageTwo";
                request.reply({ body: { data } });
            });
        });
        mountPublicFederatedList(<IdentityList />);
        cy.wait(["@tribePageOne", "@tribePageOne"]);
        cy.contains("a", "Public tribe 0").should("exist");
        cy.contains("No more results").should("not.exist");
        cy.scrollTo("bottom");
        cy.wait("@tribePageTwo");
        cy.contains("a", "Public tribe 0").should("exist");
        cy.contains("a", "Public tribe 20").should("exist");
        cy.contains("No more results").should("exist");
        cy.get("@exhaustedTribeSource").should("not.have.been.called");
    });
});
