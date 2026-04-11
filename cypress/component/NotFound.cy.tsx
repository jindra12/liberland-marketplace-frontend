import { mountMainRoute, screenshotStep } from "../support/component-tests/utils";

describe("not found", () => {
    it("shows the 404 page and returns home", () => {
        mountMainRoute("/definitely-not-a-real-route");

        cy.contains("Page not found", { timeout: 20000 }).should("be.visible");
        cy.contains("The page you requested does not exist.").should("be.visible");
        screenshotStep("not-found-page-visible");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
        screenshotStep("not-found-returned-home");
    });
});
