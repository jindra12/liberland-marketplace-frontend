import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, screenshotStep } from "../support/component-tests/utils";

describe("identity cards", () => {
    const loadIdentityCards = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL, COOP_SERVER_URL]);
    };

    it("shows the identity preview section", () => {
        cy.viewport(1200, 1200);
        loadIdentityCards();

        cy.get(".SplashEntityCard--companies", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__itemLink").contains("Harbor Labs").should("be.visible");
            cy.get(".SplashEntityCard__itemLink").contains("Reef Studio").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });
        screenshotStep("identity-cards-desktop");
    });

    it("shows the identity preview section on mobile", () => {
        cy.viewport(390, 844);
        loadIdentityCards();

        cy.get(".SplashEntityCard--companies", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__itemLink").contains("Harbor Labs").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });
        screenshotStep("identity-cards-mobile");
    });
});
