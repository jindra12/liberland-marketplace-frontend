import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { homepageQueries, mountMainHome, waitForCollectionResults } from "../support/component-tests/utils";

describe("company card", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        mountMainHome();
        homepageQueries();
        waitForCollectionResults(
            MAIN_SERVER_URL,
            "ListCompaniesByIdentity",
            { identityId: "identity-fourfold", page: 1, limit: 3, url: MAIN_SERVER_URL },
            "Companies",
        );
    });

    it("shows title, avatar, website, share controls, and overflow link", () => {
        cy.contains(".SplashPage__identityHeadingLink", "Fourfold Harbor")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
            .within(() => {
                cy.get(".SplashEntityCard--companies").should("be.visible");
                cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
                cy.contains(".SplashEntityCard__itemLink", "Harbor Labs").should("be.visible");
                cy.contains(".SplashEntityCard__itemLink", "Reef Studio").should("be.visible");
                cy.contains(".SplashEntityCard__meta a", "Website").should("be.visible");
                cy.get(".SplashEntityCard__inlineActions").should("be.visible");
                cy.get(".NativeShareButton").should("be.visible");
            });
    });
});
