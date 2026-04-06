import { homepageQueries, mountMainHome } from "../support/component-tests/utils";

describe("identity cards", () => {
    it("hides identities with no related market cards", () => {
        mountMainHome();
        homepageQueries();

        cy.contains(".SplashPage__identityHeadingLink", "Sage Bloom").should("not.exist");
    });

    it("shows a four-company identity preview with a more link", () => {
        mountMainHome();
        homepageQueries();

        cy.contains(".SplashPage__identityHeadingLink", "Fourfold Harbor")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
            .within(() => {
                cy.get(".SplashEntityCard--companies").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold One").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold Two").should("be.visible");
                cy.get(".SplashEntityCard__itemLink").contains("Fourfold Three").should("be.visible");
                cy.contains(".SplashEntityCard__moreLink", "And +1 more").should("be.visible");
            });
    });
});
