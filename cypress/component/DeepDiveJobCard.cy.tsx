import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, screenshotStep } from "../support/component-tests/utils";

describe("job card", () => {
    const loadJobCard = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL, COOP_SERVER_URL]);
    };

    it("shows employment type, salary, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadJobCard();

        cy.get(".SplashEntityCard--jobs", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Dockmaster").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Harbor Operator").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Harbor Analyst").should("be.visible");
            cy.contains(".SplashEntityCard__meta", "Full-time").should("be.visible");
            cy.contains(".SplashEntityCard__meta", "USD 3,200 – 4,000").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
            cy.get(".SplashEntityCard__inlineActions").should("be.visible");
            cy.get(".NativeShareButton").should("be.visible");
        });
    });
});
