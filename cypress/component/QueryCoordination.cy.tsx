import React from "react";
import { QueryClient, QueryObserver, onlineManager } from "@tanstack/react-query";
import { MARKETPLACE_QUERY_DEFAULTS } from "../../src/components/query/constants";
import { SortContentBySelect } from "../../src/components/SortContentBySelect";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { CursorListProbe } from "../support/security-regressions/CursorListProbe";
import { CompanyList } from "../../src/components/lists/CompanyList";

describe("Federated query coordination", { retries: 0 }, () => {
    it("refreshes stale remounted data and reconnects without refetching a fresh cache", () => {
        const client = new QueryClient({ defaultOptions: MARKETPLACE_QUERY_DEFAULTS });
        const queryFn = cy.stub().resolves("Current marketplace record");
        const key = ["freshness", MAIN_SERVER_URL];
        client.setQueryData(key, "Outdated record", { updatedAt: Date.now() - 60000 });
        const observer = new QueryObserver(client, { queryKey: key, queryFn });
        client.mount();
        const unsubscribe = observer.subscribe(() => undefined);
        cy.wrap(queryFn).should("have.been.calledOnce");
        cy.wrap(observer).should((current) =>
            expect(current.getCurrentResult().data).to.equal("Current marketplace record"),
        );
        cy.then(() => {
            unsubscribe();
            const stop = observer.subscribe(() => undefined);
            expect(queryFn.callCount).to.equal(1);
            stop();
            client.setQueryData(key, "Stale again", { updatedAt: Date.now() - 60000 });
            onlineManager.setOnline(false);
            const detach = observer.subscribe(() => undefined);
            onlineManager.setOnline(true);
            cy.wrap(queryFn).should("have.been.calledTwice");
            cy.wrap(observer).should((current) =>
                expect(current.getCurrentResult().data).to.equal("Current marketplace record"),
            );
            cy.then(() => {
                detach();
                client.unmount();
                client.clear();
            });
        });
    });
    it("restarts a real paginated list at page one when its ordering changes", () => {
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept<{ variables: { page: number; sort: string } }>("POST", `${url}/api/graphql`, (request) => {
                const main = url === MAIN_SERVER_URL;
                const { page, sort } = request.body.variables;
                if (main) {
                    request.alias = sort === "-createdAt" ? "newCompanyOrder" : `hotCompanyPage${page}`;
                }
                request.reply({
                    data: {
                        Companies: {
                            docs: main ? [{ id: `${sort}-${page}`, name: `${sort} page ${page}` }] : [],
                            hasNextPage: main && page === 1,
                            page,
                            totalDocs: main ? 2 : 0,
                        },
                    },
                });
            });
        });
        mountPublicFederatedList(
            <>
                <SortContentBySelect />
                <CompanyList />
            </>,
        );
        cy.wait("@hotCompanyPage1");
        cy.contains("button", "Load more").click();
        cy.wait("@hotCompanyPage2");
        cy.contains("a", "-contentRankScore page 2").should("exist");
        cy.get(".AppHeader__sortSelect").click();
        cy.get(".ant-select-item-option").contains("New").click();
        cy.wait("@newCompanyOrder").its("request.body.variables.page").should("equal", 1);
        cy.contains("a", "-createdAt page 1").should("exist");
        cy.contains("a", "-contentRankScore page 2").should("not.exist");
    });

    it("does not fetch another page from a source whose real previous page ended", () => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const mainSecondPage = cy.stub().as("exhaustedSource");
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept<{ variables: { page: number } }>("POST", `${url}/api/graphql`, (request) => {
                if (url === MAIN_SERVER_URL && request.body.variables.page === 2) {
                    mainSecondPage();
                }
                request.alias = request.body.variables.page === 1 ? "firstCursorPage" : "secondCursorPage";
                request.reply({
                    body: {
                        data: {
                            Companies: {
                                docs: [
                                    {
                                        id: `company-${url}-${request.body.variables.page}`,
                                        name: `Page ${request.body.variables.page}`,
                                    },
                                ],
                                hasNextPage: url === COOP_SERVER_URL,
                            },
                        },
                    },
                });
            });
        });
        mountPublicFederatedList(<CursorListProbe page={1} />, client);
        cy.wait(["@firstCursorPage", "@firstCursorPage"]);
        cy.contains("Page 1").should("exist");
        cy.then(() => {
            const mainPage = client
                .getQueryCache()
                .findAll({ queryKey: ["ListCompanies"] })
                .find((query) => query.queryKey.includes(MAIN_SERVER_URL));
            expect(mainPage?.state.data).to.have.nested.property("Companies.hasNextPage", false);
        });
        cy.then(() => mountPublicFederatedList(<CursorListProbe page={2} />, client));
        cy.wait("@secondCursorPage");
        cy.contains("Page 2").should("exist");
        cy.get("@exhaustedSource").should("not.have.been.called");
    });

    it("uses a distinct source-scoped cache key after changing content ordering", () => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        client.setQueryData(["wallet-balance-fixture"], { balance: "12" });
        [MAIN_SERVER_URL, COOP_SERVER_URL].forEach((url) => {
            cy.intercept<{ variables: { sort: string } }>("POST", `${url}/api/graphql`, (request) => {
                request.alias = request.body.variables.sort === "-createdAt" ? "newSort" : "hotSort";
                request.reply({
                    body: {
                        data: {
                            Companies: {
                                docs: [{ id: "company", name: request.body.variables.sort }],
                                hasNextPage: false,
                            },
                        },
                    },
                });
            });
        });
        mountPublicFederatedList(
            <>
                <SortContentBySelect />
                <CursorListProbe page={1} />
            </>,
            client,
        );
        cy.wait(["@hotSort", "@hotSort"]);
        cy.then(() => {
            const initialKeys = client
                .getQueryCache()
                .findAll({ queryKey: ["ListCompanies"] })
                .map((query) => JSON.stringify(query.queryKey));
            cy.get(".AppHeader__sortSelect").click();
            cy.get(".ant-select-item-option").contains("New").click();
            cy.get(".AppHeader__sortSelect").should("contain.text", "New");
            cy.wait(["@newSort", "@newSort"]);
            cy.then(() => {
                const changedKeys = client
                    .getQueryCache()
                    .findAll({ queryKey: ["ListCompanies"] })
                    .map((query) => JSON.stringify(query.queryKey));
                expect(changedKeys.some((key) => !initialKeys.includes(key))).to.equal(true);
                expect(client.getQueryState(["wallet-balance-fixture"])?.isInvalidated).to.equal(false);
                expect(client.getQueryData(["wallet-balance-fixture"])).to.deep.equal({ balance: "12" });
            });
        });
    });
});
