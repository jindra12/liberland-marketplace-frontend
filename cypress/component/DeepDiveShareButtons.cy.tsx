import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    homepageQueries,
    mountMainRoute,
    waitForCollectionQuery,
    waitForPageShell,
    waitForRouteLoad,
} from "../support/component-tests/utils";

describe("share buttons", () => {
    it("shows list share controls on the companies list and home cards", () => {
        mountMainRoute("/");
        waitForPageShell();
        homepageQueries();

        cy.get(".MarketAccordion .NativeShareButton").its("length").should("be.greaterThan", 0);
        cy.get(".SplashPage__tribesSection .NativeShareButton").its("length").should("be.greaterThan", 0);
        cy.get(".SplashPage__syndicationCardActions .NativeShareButton").its("length").should("be.greaterThan", 0);

        mountMainRoute("/companies");
        waitForRouteLoad(".LoadingSkeleton--collection");
        waitForCollectionQuery(MAIN_SERVER_URL, "ListCompanies", { limit: 20, page: 1 }, "Companies", "Harbor Labs");

        cy.get(".ListShareDetailButtons").should("be.visible");
        cy.get(".NativeShareButton").should("be.visible");
        cy.get(".ActionBtn").contains("Details").should("be.visible");
    });
});
