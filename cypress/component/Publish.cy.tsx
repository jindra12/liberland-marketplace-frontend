import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAuthenticatedDetailRoute,
    mountAuthenticatedMainRoute,
    screenshotStep,
} from "../support/component-tests/utils";

describe("publish", () => {
    it("shows the server selector when multiple endpoints are configured", () => {
        mountAuthenticatedDetailRoute("/publish", [MAIN_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".PublishServer", "Choose where to publish", { timeout: 20000 }).should("be.visible");
        screenshotStep("publish-server-selector-visible");
        cy.contains(".PublishServer__card", "Main").click();
        cy.contains(".PublishServer__summary", "Publishing to Main").should("be.visible");
        screenshotStep("publish-server-summary-visible");
        cy.contains(".PublishServer__summary button", "Continue to publish").click();
        cy.contains(".Publish", "Publish your ad", { timeout: 20000 }).should("be.visible");
        screenshotStep("publish-form-chooser-visible");
        cy.contains(".Publish__category", "Job").should("be.visible");
    });

    it("opens the publish form chooser directly when only one endpoint is configured", () => {
        mountAuthenticatedMainRoute("/publish");

        cy.contains(".Publish", "Publish your ad", { timeout: 20000 }).should("be.visible");
        screenshotStep("publish-chooser-visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
    });
});
