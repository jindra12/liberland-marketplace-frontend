import {
    assertImageLoaded,
    homepageQueries,
    homepageMobileQueries,
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
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
        cy.get(".MarketAccordion").should("be.visible");
        cy.get(".MarketAccordion__postSection--top .AppList__cardItem", { timeout: 20000 }).should("have.length", 2);
        assertImageLoaded(".MarketAccordion__postSection--top .PostList__coverImage");
        assertImageLoaded(".MarketAccordion__postSection--top .PostList__companyAvatar");
        cy.get(".MarketAccordion__postSection--firstMiddle .AppList__cardItem", { timeout: 20000 }).should("have.length", 3);
        cy.get(".MarketAccordion__postSection--secondMiddle .AppList__cardItem", { timeout: 20000 }).should("have.length", 3);
        cy.get(".MarketAccordion__postSection--thirdMiddle .AppList__cardItem", { timeout: 20000 }).should("have.length", 4);
        cy.get(".MarketAccordion__postSection--rest .AppList__cardItem", { timeout: 20000 }).should("have.length.at.least", 1);
        cy.get(".MarketAccordion__postSection--rest .AppList__title")
            .should("have.class", "screen-reader-only")
            .and("have.css", "position", "absolute")
            .and("have.css", "width", "1px");
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
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
        homepageMobileQueries();
        cy.get(".MarketAccordionMobile").should("be.visible");
        cy.get(".MarketAccordionMobile__section").should("have.length", 1);
        cy.contains(".MarketAccordionMobile__section", "Posts")
            .find(".AppList__cardItem", { timeout: 20000 })
            .should("have.length", 4);
        assertImageLoaded(".MarketAccordionMobile__section .PostList__coverImage");
        assertImageLoaded(".MarketAccordionMobile__section .PostList__companyAvatar");
        cy.get(".MarketAccordion").should("not.exist");
        cy.get(".SplashPage__syndicationSection").should("not.exist");

        screenshotStep("homepage-mobile");
    });
});
