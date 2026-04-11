import { homepageQueries, mountMainHome } from "../support/component-tests/utils";

describe("identity cards", () => {
    it("shows the identity preview section", () => {
        mountMainHome();
        homepageQueries();

        cy.contains(".SplashPage__identityHeadingLink", "Fourfold Harbor")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
        .within(() => {
                cy.get(".SplashEntityCard--companies").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Harbor Labs").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Reef Studio").should("be.visible");
            });
    });
});
