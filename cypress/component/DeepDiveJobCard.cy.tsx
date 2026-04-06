import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { homepageQueries, mountMainHome, waitForCollectionQuery } from "../support/component-tests/utils";

describe("job card", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        mountMainHome();
        homepageQueries();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListJobsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Jobs",
            "Dockmaster",
        );
    });

    it("shows employment type, salary, share controls, and overflow link", () => {
        cy.contains(".SplashPage__identityHeadingLink", "Nova Rivers")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
            .within(() => {
                cy.get(".SplashEntityCard--jobs").should("be.visible");
                cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
                cy.contains(".SplashEntityCard__itemLink", "Dockmaster").should("be.visible");
                cy.contains(".SplashEntityCard__itemLink", "Harbor Operator").should("be.visible");
                cy.contains(".SplashEntityCard__itemLink", "Harbor Analyst").should("be.visible");
                cy.contains(".SplashEntityCard__meta", "Full-time").should("be.visible");
                cy.contains(".SplashEntityCard__meta", "USD 3,200 – 4,000").should("be.visible");
                cy.get(".SplashEntityCard__inlineActions").should("be.visible");
                cy.get(".NativeShareButton").should("be.visible");
                cy.contains(".ActionBtn", "Details").should("be.visible");
                cy.contains(".SplashEntityCard__moreLink", "And +1 more").should("be.visible");
            });
    });
});
