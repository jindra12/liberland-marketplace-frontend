import {
    homepageMobileQueries,
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
        homepageMobileQueries();

        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroTitle").should("be.visible").contains("Discover");
        cy.get(".MarketAccordionMobile").should("be.visible");
        cy.get(".MarketAccordionMobile .SplashEntityCard--products .SplashEntityCard__itemCard").should(
            "have.length",
            3,
        );
        cy.get(".MarketAccordionMobile .SplashEntityCard--jobs .SplashEntityCard__itemCard").should("have.length", 3);
        cy.get(".MarketAccordion").should("not.exist");
        cy.get(".SplashPage__syndicationSection").should("not.exist");
        screenshotStep("homepage-mobile");
    });
});
