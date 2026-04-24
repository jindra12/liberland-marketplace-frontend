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
        cy.pause();
        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroBackdrop").should("be.visible");
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
        cy.get(".MarketAccordion").should("be.visible");
        cy.get(".MarketAccordion__postSection--top .AppList__cardItem", { timeout: 20000 }).should("have.length", 2);
        cy.get(".MarketAccordion__titleLink--posts .MarketAccordion__title")
            .first()
            .should("have.class", "screen-reader-only")
            .and("have.css", "position", "absolute");
        cy.get(".MarketAccordion__postSection--top .AppList__cardItem").first().should(($item) => {
            const itemRect = $item[0].getBoundingClientRect();
            const section = $item.closest(".MarketAccordion__section")[0];
            const sectionRect = section.getBoundingClientRect();
            expect(itemRect.width).to.be.at.most(600);
            expect(Math.abs(itemRect.left + itemRect.width / 2 - (sectionRect.left + sectionRect.width / 2))).to.be.lessThan(20);
        });
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
        cy.pause();
        cy.get(".SplashPage").should("be.visible");
        cy.get(".SplashPage__heroBackdrop").should("be.visible");
        cy.get(".SplashPage__heroWordmark").should("be.visible").contains("NSWAP");
        cy.get(".SplashPage__heroPrimaryBtn").should("be.visible").contains("Explore market");
        cy.get(".SplashPage__heroSecondaryBtn").should("be.visible").contains("Explore Tribes");
        homepageMobileQueries();
        cy.get(".MarketAccordionMobile").should("be.visible");
        cy.get(".MarketAccordionMobile__section").should("have.length", 1);
        cy.get(".MarketAccordionMobile__section .MarketAccordion__titleLink--posts .MarketAccordion__title")
            .first()
            .should("have.class", "screen-reader-only")
            .and("have.css", "position", "absolute");
        cy.contains(".MarketAccordionMobile__section", "Posts")
            .find(".AppList__cardItem", { timeout: 20000 })
            .should("have.length", 4);
        cy.contains(".MarketAccordionMobile__section", "Posts")
            .find(".PostList__companyInlineLink--mobile")
            .first()
            .should("be.visible")
            .and("have.css", "align-items", "center")
            .find(".PostList__companyAvatar--mobile")
            .should(($avatar) => {
                const avatarRect = $avatar[0].getBoundingClientRect();
                expect(avatarRect.width).to.equal(32);
                expect(avatarRect.height).to.equal(32);
            });
        cy.contains(".MarketAccordionMobile__section", "Posts")
            .find(".PostList__companyName--mobile")
            .first()
            .should("be.visible");
        cy.contains(".MarketAccordionMobile__section", "Posts").find(".AppList__cardItem").first().should(($item) => {
            const itemRect = $item[0].getBoundingClientRect();
            const section = $item.closest(".MarketAccordionMobile__section")[0];
            const sectionRect = section.getBoundingClientRect();
            expect(itemRect.width).to.be.at.most(600);
            expect(Math.abs(itemRect.left + itemRect.width / 2 - (sectionRect.left + sectionRect.width / 2))).to.be.lessThan(20);
        });
        assertImageLoaded(".MarketAccordionMobile__section .PostList__coverImage");
        cy.get(".MarketAccordion").should("not.exist");
        cy.get(".SplashPage__syndicationSection").should("not.exist");

        screenshotStep("homepage-mobile");
    });
});
