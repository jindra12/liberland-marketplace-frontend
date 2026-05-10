import { COOP_SERVER_URL, GUEST_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAuthenticatedDetailRoute,
    mountAuthenticatedMainRoute,
    screenshotStep,
} from "../support/component-tests/utils";

describe("publish", () => {
    it("skips the server selector when only one enabled endpoint can publish content", () => {
        mountAuthenticatedDetailRoute("/publish", [MAIN_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.get(".PublishServer").should("not.exist");
        screenshotStep("publish-form-chooser-visible");
        cy.contains(".Publish__category", "Job").should("be.visible");
    });

    it("opens the publish form chooser directly when only one endpoint is configured", () => {
        mountAuthenticatedMainRoute("/publish");

        cy.contains(".Publish", "Create", { timeout: 20000 }).should("be.visible");
        cy.contains(".AppHeader__publishBtn", "Create").should("be.visible").within(() => {
            cy.get(".anticon-plus").should("be.visible");
        });
        screenshotStep("publish-chooser-visible");
        cy.contains(".Publish__category", "Company").should("be.visible");
        cy.contains(".Publish__category", "Venture").should("be.visible");
    });

    it("goes straight to post creation when the selected server lacks permission", () => {
        mountAuthenticatedDetailRoute("/publish", ["http://127.0.0.1:3013", MAIN_SERVER_URL, GUEST_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".PublishServer", "Choose where to publish", { timeout: 20000 }).should("be.visible");
        cy.contains(".PublishServer__card", COOP_SERVER_URL).click();
        cy.contains(".PublishServer__summary button", "Continue to publish").click();
        cy.contains(".Publish", "Write a Post", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish__category", "Company").should("not.exist");
        cy.contains(".Publish__category", "Post").should("not.exist");
        cy.contains(".Publish__category", "Job").should("not.exist");
        cy.contains(".Publish__category", "Product").should("not.exist");
        cy.contains(".Publish__category", "Venture").should("not.exist");
    });

    it("shows the email verification warning for unverified users", () => {
        mountAuthenticatedMainRoute("/publish", false);

        cy.contains(".Publish", "Email not verified", { timeout: 20000 }).should("be.visible");
        cy.contains(".Publish", "You need to verify your email address before you can publish listings.").should(
            "be.visible",
        );
    });
});
