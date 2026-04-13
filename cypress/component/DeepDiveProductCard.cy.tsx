import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    screenshotStep,
    seedCartSecret,
    waitForCollectionQuery,
    waitForDetailQuery,
} from "../support/component-tests/utils";

describe("product card", () => {
    const loadHome = () => {
        mountAnonymousRoute("/tribes/identity-nova", [MAIN_SERVER_URL, COOP_SERVER_URL]);
        seedCartSecret(MAIN_SERVER_URL, "alpha-secret");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "IdentityById",
            { id: "identity-nova" },
            "Identity",
            "identity-nova",
            "Nova Rivers",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 7 },
            "Products",
            "Solar Widget",
        );
    };

    it("shows price, cart count, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadHome();

        cy.get(".SplashEntityCard--products", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Solar Widget").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "Sun Panel").should("be.visible");
            cy.contains(".SplashEntityCard__itemLink", "River Beacon").should("be.visible");
            cy.contains(".SplashEntityCard__meta", "Price: 0.49").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
            cy.get(".SplashEntityCard__inlineActions").should("be.visible");
            cy.get(".NativeShareButton").should("be.visible");
        });
        screenshotStep("product-card-desktop");
    });

    it("shows the product card on mobile", () => {
        cy.viewport(390, 844);
        loadHome();

        cy.get(".SplashEntityCard--products", { timeout: 20000 }).should("be.visible").within(() => {
            cy.get(".SplashEntityCard__avatar").should("have.length.at.least", 1);
            cy.contains(".SplashEntityCard__itemLink", "Solar Widget").should("be.visible");
            cy.get(".LikeButton").should("be.visible");
        });
        screenshotStep("product-card-mobile");
    });
});
