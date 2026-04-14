import {
    homepageQueries,
    mountMainRoute,
    screenshotStep,
    waitForPageShell,
} from "../support/component-tests/utils";

describe("homepage", () => {
    it("shows the splash page on desktop", () => {
        cy.viewport(1440, 1200);
        mountMainRoute("/");
        waitForPageShell();
        homepageQueries();
    
        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroBackdrop").should("be.visible");
        cy.get(".SplashPage .AnimatedIn").first().should("have.css", "opacity", "1");
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
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
        cy.get(".SplashPage__heroBackdrop").should("be.visible");
        cy.get(".SplashPage .AnimatedIn").first().should("have.css", "opacity", "1");
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
        cy.get(".MarketAccordionMobile").should("be.visible");
        cy.contains(".MarketAccordionMobile__section", "Products")
            .find(".SplashEntityCard__itemCard")
            .should("have.length", 3);
        cy.contains(".MarketAccordionMobile__section", "Jobs").find(".SplashEntityCard__itemCard").should("have.length", 3);
        cy.get(".MarketAccordion").should("not.exist");
        cy.get(".SplashPage__syndicationSection").should("not.exist");

        screenshotStep("homepage-mobile");
    });
});
