import { mountMainRoute, screenshotStep } from "../support/component-tests/utils";

describe("unsubscribe", () => {
    it("shows the invalid-link page when required query params are missing", () => {
        mountMainRoute("/unsubscribe");

        cy.contains("Invalid link", { timeout: 20000 }).should("be.visible");
        cy.contains("This unsubscribe link is missing required details.").should("be.visible");
        screenshotStep("unsubscribe-invalid-link-missing-query-params");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
        screenshotStep("unsubscribe-returned-home-missing-query-params");
    });

    it("shows the invalid-link page when the notification type is unsupported", () => {
        mountMainRoute("/unsubscribe?type=widgets&id=widget-1&email=nova@example.test");

        cy.contains("Invalid link", { timeout: 20000 }).should("be.visible");
        cy.contains("This unsubscribe link does not target a supported notification type.").should("be.visible");
        screenshotStep("unsubscribe-invalid-link-unsupported-type");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
        screenshotStep("unsubscribe-returned-home-unsupported-type");
    });
});
