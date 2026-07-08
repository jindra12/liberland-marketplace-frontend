import { activeFixtures, resetGraphQLMock } from "../support/graphqlMock/runtimeState";

import { COOP_SERVER_URL, MAIN_SERVER_URL, syndicationDetailRoute } from "../support/component-tests/constants";
import { dismissNsfwModal } from "../support/component-tests/utils";
import {
    mountAuthenticatedDetailRoute,
    mountMainRoute,
    screenshotStep,
    waitForCollectionQuery,
} from "../support/component-tests/utils";

describe("syndication detail", () => {
    beforeEach(() => {
        resetGraphQLMock();
    });

    it("shows endpoint metadata and share controls for an enabled endpoint", () => {
        mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL));
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListPublishedSyndicationUrls",
            {},
            "Syndications",
            "Main",
        );

        dismissNsfwModal();
        cy.get(".SyndicationDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Main").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("Enabled").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("Primary endpoint").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("NSFW").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains("Main").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains("127.0.0.1:3010").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains(MAIN_SERVER_URL).should("be.visible");
        cy.contains("Visit URL").should("not.exist");
        cy.get(".ShareSection").should("be.visible");
        cy.contains(".ShareSection", "Share this endpoint").should("not.exist");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".SubscribeButton").should("not.exist");
        cy.get(".EntityDetail > .ant-divider").should("have.length", 3);
        screenshotStep("syndication-detail-nsfw-desktop");
    });

    it("shows the NSFW warning on mobile too", () => {
        cy.viewport(390, 844);
        mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL));
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListPublishedSyndicationUrls",
            {},
            "Syndications",
            "Main",
        );

        dismissNsfwModal();
        cy.get(".SyndicationDetail").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("NSFW").should("be.visible");
        cy.get(".ShareSection").should("be.visible");
        screenshotStep("syndication-detail-nsfw-mobile");
    });

    it("keeps the layout to one divider when the endpoint has no description", () => {
        const mainSyndication = activeFixtures.syndications.find((entry) => entry.url === MAIN_SERVER_URL);

        if (mainSyndication === undefined) {
            throw new Error("Missing main syndication fixture data");
        }

        mainSyndication.description = "";

        mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL));
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListPublishedSyndicationUrls",
            {},
            "Syndications",
            "Main",
        );

        dismissNsfwModal();
        cy.get(".SyndicationDetail__description").should("not.exist");
        cy.get(".EntityDetail > .ant-divider").should("have.length", 2);
        cy.get(".ShareSection").should("be.visible");
    });

    it("shows when the endpoint cannot publish listings", () => {
        mountAuthenticatedDetailRoute(syndicationDetailRoute(COOP_SERVER_URL), [MAIN_SERVER_URL, COOP_SERVER_URL]);
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListPublishedSyndicationUrls",
            {},
            "Syndications",
            "Main",
        );

        cy.get(".SyndicationDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Co-op Main").should("be.visible");
    });

    it("shows the 404 fallback when the endpoint is not in the current context", () => {
        mountMainRoute(syndicationDetailRoute("http://127.0.0.1:3999"));
        cy.contains("Syndicated URL not found", { timeout: 20000 }).should("be.visible");
        cy.contains("This syndicated URL is not available in your current marketplace context.").should("be.visible");
        cy.contains("Back to syndication").should("be.visible");
    });
});
