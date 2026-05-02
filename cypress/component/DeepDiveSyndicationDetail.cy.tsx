import { MAIN_SERVER_URL, syndicationDetailRoute } from "../support/component-tests/constants";
import { mountMainRoute, screenshotStep, waitForCollectionQuery } from "../support/component-tests/utils";

describe("syndication detail", () => {
    it("shows endpoint metadata and share controls for an enabled endpoint", () => {
        mountMainRoute(syndicationDetailRoute(MAIN_SERVER_URL));
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListPublishedSyndicationUrls",
            {},
            "Syndications",
            "Main",
        );

        cy.get(".SyndicationDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Main").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("Enabled").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("Primary endpoint").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("NSFW").should("be.visible");
        cy.contains("You must be 18+ to see this content.").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains("Main").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains("127.0.0.1:3010").should("be.visible");
        cy.get(".SyndicationDetail__meta").contains(MAIN_SERVER_URL).should("be.visible");
        cy.contains("Visit URL").should("not.exist");
        cy.get(".ShareSection").should("be.visible").contains("Share this endpoint");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".SubscribeButton").should("not.exist");
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

        cy.get(".SyndicationDetail").should("be.visible");
        cy.get(".SyndicationDetail__tagRow").contains("NSFW").should("be.visible");
        cy.contains("You must be 18+ to see this content.").should("be.visible");
        cy.get(".ShareSection").should("be.visible");
        screenshotStep("syndication-detail-nsfw-mobile");
    });

    it("shows the 404 fallback when the endpoint is not in the current context", () => {
        mountMainRoute(syndicationDetailRoute("http://127.0.0.1:3999"));
        cy.contains("Syndicated URL not found", { timeout: 20000 }).should("be.visible");
        cy.contains("This syndicated URL is not available in your current marketplace context.").should("be.visible");
        cy.contains("Back to syndication").should("be.visible");
    });
});
