import { mountProfileRoute } from "../support/component-tests/utils";

describe("profile", () => {
    beforeEach(() => {
        mountProfileRoute();
    });

    it("opens the Profile page for an authenticated user", () => {
        cy.contains("h2", "My Profile").should("be.visible");
        cy.contains(".Profile__info", "Nova Rivers").should("be.visible");
        if (Cypress.browser.isHeaded) {
            cy.pause();
        }
    });
});
