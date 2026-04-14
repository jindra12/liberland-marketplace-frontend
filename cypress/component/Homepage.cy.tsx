import { homepageQueries, mountMainRoute, screenshotStep, waitForPageShell } from "../support/component-tests/utils";

describe("homepage", () => {
    it("shows the splash page on desktop", () => {
        cy.viewport(1440, 1200);
        mountMainRoute("/");
        waitForPageShell();
        homepageQueries();

        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroTitle").should("be.visible").contains("Discover");
        cy.get(".MarketAccordion").should("be.visible");
        cy.get(".MarketAccordion .SplashEntityCard--tribes").should("be.visible");
        cy.get(".SplashPage__syndicationSection").should("be.visible");
        screenshotStep("homepage-desktop");
    });

    it("shows the splash page on mobile", () => {
        cy.viewport(390, 844);
        mountMainRoute("/");
        waitForPageShell();

        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroTitle").should("be.visible").contains("Discover");
        cy.get(".MarketAccordion").should("be.visible");
        cy.get(".MarketAccordion .SplashEntityCard--tribes").should("be.visible");
        screenshotStep("homepage-mobile");
    });
});
