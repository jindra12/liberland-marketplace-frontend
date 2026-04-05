import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "../support/constants";
import {
    goHome,
    openAppMenu,
    openSyndicationPage,
    resetMockScenario,
    setInitialPath,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForDetailContent,
    waitForSplashContent,
} from "../support/marketplace";
import { createRequestRecorder, expectGraphqlRequest } from "../support/network";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

describe("anonymous syndication", () => {
    let network: ReturnType<typeof createRequestRecorder>;

    beforeEach(() => {
        network = createRequestRecorder();
        cy.intercept("POST", "**/api/graphql", (req) => {
            network.recordRequest(req);
        });
        resetMockScenario(alphaUrl);
        resetMockScenario(betaUrl);
        setInitialPath("/");
        mount(<Main />);
        goHome();
        waitForSplashContent();
    });

    it("anonymous users do not see syndication when there is only one server", () => {
        setMarketplaceEndpoints([
            {
                enabled: true,
                name: "Main",
                value: alphaUrl,
            },
        ]);

        openAppMenu();
        cy.get(".AppHeader__drawerNav").contains("Syndication").should("not.exist");
        expectGraphqlRequest(network.graphqlRequests, "ListPublishedSyndicationUrls");
    });

    it("anonymous users can open the syndication menu and toggle a syndicated server", () => {
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

        openSyndicationPage();
        waitForCollectionContent();
        cy.contains("h2", "Syndication").should("be.visible");
        cy.contains("a", "Alpha Mock Market").click();
        waitForDetailContent();

        cy.get(".SyndicationDetail").should("be.visible");
        cy.contains("button", "Disable URL").should("be.visible").click();
        cy.contains("button", "Enable URL").should("be.visible");
        cy.contains("Disabled locally").should("be.visible");
        cy.contains("button", "Enable URL").click();
        cy.contains("button", "Disable URL").should("be.visible");
        cy.contains("Enabled in search and lists").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "ListPublishedSyndicationUrls");
    });
});
