import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "../support/constants";
import {
    clickHeaderLink,
    clickSplashSectionLink,
    clickVisibleLink,
    goHome,
    resetMockScenario,
    scrollToBottom,
    setInitialPath,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForDetailContent,
    waitForSplashContent,
} from "../support/marketplace";
import { createRequestRecorder, expectGraphqlRequest } from "../support/network";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

describe("anonymous lists and details", () => {
    let network: ReturnType<typeof createRequestRecorder>;

    beforeEach(() => {
        network = createRequestRecorder();
        cy.intercept("POST", "**/api/graphql", (req) => {
            network.recordRequest(req);
        });
        resetMockScenario(alphaUrl);
        resetMockScenario(betaUrl, "pagination");
        setMarketplaceEndpoints([
            {
                enabled: true,
                name: "Main",
                value: betaUrl,
            },
            {
                enabled: true,
                name: "Alpha Mock Market",
                value: alphaUrl,
            },
        ]);
        setInitialPath("/");
        mount(<Main />);
        goHome();
    });

    it("anonymous users can reach every list page and load more results", () => {
        const listPages = [
            {
                label: "Jobs",
                open: () => clickHeaderLink("Jobs"),
                operationName: "ListJobs",
                title: "Jobs",
                url: /\/jobs$/,
            },
            {
                label: "Products / Services",
                open: () => clickHeaderLink("Market"),
                operationName: "ListProducts",
                title: "Products / Services",
                url: /\/products-services$/,
            },
            {
                label: "Companies",
                open: () => clickHeaderLink("Companies"),
                operationName: "ListCompanies",
                title: "Companies",
                url: /\/companies$/,
            },
            {
                label: "Ventures",
                open: () => clickHeaderLink("Ventures"),
                operationName: "ListStartups",
                title: "Ventures",
                url: /\/ventures$/,
            },
            {
                label: "Tribes",
                open: () => clickHeaderLink("Tribes"),
                operationName: "ListIdentities",
                title: "Tribes",
                url: /\/tribes$/,
            },
        ];

        listPages.forEach((listPage) => {
            goHome();
            waitForSplashContent();
            listPage.open();
            cy.location("pathname").should("match", listPage.url);
            waitForCollectionContent();
            cy.get(".AppList__title").should("have.text", listPage.title);
            expectGraphqlRequest(network.graphqlRequests, listPage.operationName);

            if (listPage.label === "Tribes") {
                cy.get(".IdentityList__title").its("length").should("be.greaterThan", 20);
                return;
            }

            cy.get(".InfinityScroll .ant-list-item").then(($items) => {
                const initialCount = $items.length;
                scrollToBottom();
                expectGraphqlRequest(network.graphqlRequests, listPage.operationName, (request) => {
                    return Number(request.variables.page) === 2;
                });
                cy.get(".InfinityScroll .ant-list-item").its("length").should("be.gt", initialCount);
            });
        });
    });

    it("anonymous users can reach each detail page and see sub-pagination landmarks", () => {
        goHome();
        waitForSplashContent();

        clickSplashSectionLink("Jobs");
        waitForCollectionContent();
        clickVisibleLink("Dense Job 1");
        waitForDetailContent();
        cy.get(".JobDetail__title").should("contain.text", "Dense Job 1");
        cy.get(".EntityCommentsSection").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "JobById");

        goHome();
        waitForSplashContent();
        clickSplashSectionLink("Products / Services");
        waitForCollectionContent();
        clickVisibleLink("Dense Ethereum Bundle A");
        waitForDetailContent();
        cy.get(".ProductDetail__purchaseSection").should("be.visible");
        cy.contains("button", "Buy now").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "ProductById");

        goHome();
        waitForSplashContent();
        clickSplashSectionLink("Companies");
        waitForCollectionContent();
        clickVisibleLink("Dense Payment Hub");
        waitForDetailContent();
        cy.get(".CompanyDetail__header").should("be.visible");
        cy.contains('[role="tab"]', "Jobs").click();
        waitForCollectionContent();
        cy.get(".InfinityScroll .ant-list-item").first().should("be.visible");
        cy.get(".InfinityScroll .ant-list-item").then(($items) => {
            const initialCount = $items.length;
            cy.window().then((win) => {
                win.scrollTo(0, win.document.body.scrollHeight);
            });
            cy.get(".InfinityScroll .ant-list-item").its("length").should("be.gt", initialCount);
        });
        expectGraphqlRequest(network.graphqlRequests, "CompanyById");
        expectGraphqlRequest(network.graphqlRequests, "ListJobsByCompany");

        goHome();
        waitForSplashContent();
        clickSplashSectionLink("Ventures");
        waitForCollectionContent();
        clickVisibleLink("Dense Venture 1");
        waitForDetailContent();
        cy.get(".StartupDetail__header").should("be.visible");
        cy.get(".EntityCommentsSection").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "StartupById");

        goHome();
        waitForSplashContent();
        clickSplashSectionLink("Tribes");
        waitForCollectionContent();
        clickVisibleLink("Syndicate Network");
        waitForDetailContent();
        cy.get(".IdentityDetail").should("be.visible");
        cy.get(".SplashEntityCard__moreLink").should("have.length", 4);
        cy.get(".SplashEntityCard__moreLink").first().click();
        cy.location("href").should("match", /\/companies\?tribe=beta-identity-network$/);
        cy.contains("h2", "Companies").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "IdentityById");
        expectGraphqlRequest(network.graphqlRequests, "ListCompaniesByIdentity");
    });
});
