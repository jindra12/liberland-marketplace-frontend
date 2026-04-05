import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "../support/constants";
import {
    clickHeaderLink,
    clickVisibleLink,
    goHome,
    resetMockScenario,
    setInitialPath,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForDetailContent,
    waitForSplashContent,
} from "../support/marketplace";
import { createRequestRecorder } from "../support/network";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

describe("anonymous comments", () => {
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
        waitForSplashContent();
    });

    const addAnonymousComment = (commentText: string) => {
        cy.get(".EntityCommentsSection").should("be.visible");
        cy.get('.EntityCommentsSection textarea[placeholder="Write your comment..."]').type(commentText);
        cy.get(".EntityCommentsSection").contains("button", "Post").click();
        cy.contains(".EntityCommentsSection", commentText, { timeout: 5000 }).should("be.visible");
    };

    const openProductDetail = (productName: string) => {
        clickVisibleLink("Explore market");
        cy.location("pathname", { timeout: 5000 }).should("match", /\/products-services(?:\?.*)?$/);
        waitForCollectionContent();
        clickVisibleLink(productName);
        waitForDetailContent();
        cy.get(".ProductDetail .EntityDetail__title").should("have.text", productName);
    };

    it("anonymous users can add a comment to a product detail page", () => {
        openProductDetail("Dense Ethereum Bundle A");
        addAnonymousComment(`Cypress product comment ${Date.now()}`);
    });

    it("anonymous users can add a comment to a company discussion tab", () => {
        clickHeaderLink("Companies");
        waitForCollectionContent();
        clickVisibleLink("Dense Payment Hub");
        waitForDetailContent();
        cy.contains('[role="tab"]', "Discussion").click();
        addAnonymousComment(`Cypress company comment ${Date.now()}`);
    });
});
