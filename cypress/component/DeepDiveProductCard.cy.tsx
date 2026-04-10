import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { homepageQueries, mountMainHome, seedCartSecret, waitForCollectionResults } from "../support/component-tests/utils";

describe("product card", () => {
    const loadDesktopHome = () => {
        cy.viewport(1200, 1200);
        mountMainHome();
        homepageQueries();
        seedCartSecret(MAIN_SERVER_URL, "alpha-secret");
        waitForCollectionResults(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 3, url: MAIN_SERVER_URL },
            "Products",
        );
    };

    it("shows price, cart count, share controls, and overflow link", () => {
        loadDesktopHome();

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
                cy.get(".SplashEntityCard__inlineActions").should("be.visible");
                cy.get(".NativeShareButton").should("be.visible");
            });
    });
});
