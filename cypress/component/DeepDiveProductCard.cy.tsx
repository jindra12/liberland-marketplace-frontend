import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { homepageQueries, mountMainHome, seedCartSecret, waitForCollectionQuery } from "../support/component-tests/utils";

describe("product card", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        mountMainHome();
        homepageQueries();
        seedCartSecret(MAIN_SERVER_URL, "alpha-secret");
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3 },
            "Products",
            "Solar Widget",
        );
    });

    it("shows price, cart count, share controls, and overflow link", () => {
        cy.contains(".SplashPage__identityHeadingLink", "Nova Rivers")
            .parents(".SplashPage__identitySection")
            .should("have.length", 1)
            .within(() => {
                cy.get(".SplashEntityCard--products").should("be.visible");
                cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
                cy.contains(".SplashEntityCard__itemLink", "Solar Widget").should("be.visible");
                cy.contains(".SplashEntityCard__itemLink", "Sun Panel").should("be.visible");
                cy.contains(".SplashEntityCard__itemLink", "River Beacon").should("be.visible");
                cy.contains(".SplashEntityCard__meta", "Price: 0.49").should("be.visible");
                cy.contains(".CartItemCount", "In cart: 2").should("be.visible");
                cy.get(".SplashEntityCard__inlineActions").should("be.visible");
                cy.get(".NativeShareButton").should("be.visible");
                cy.contains(".ActionBtn", "Details").should("be.visible");
                cy.contains(".SplashEntityCard__moreLink", "And +1 more").should("be.visible");
            });
    });
});
