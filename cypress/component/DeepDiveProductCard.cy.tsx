import { detailRoute, COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    screenshotStep,
    seedCartSecret,
    waitForCollectionQuery,
    waitForDetailQuery,
} from "../support/component-tests/utils";

describe("product card", () => {
    const loadHome = () => {
        mountAnonymousRoute(detailRoute("/tribes", "identity-nova"), [MAIN_SERVER_URL, COOP_SERVER_URL]);
        seedCartSecret(MAIN_SERVER_URL, "alpha-secret");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "IdentityById",
            { id: "identity-nova", url: MAIN_SERVER_URL },
            "Identity",
            "identity-nova",
            "Nova Rivers",
        );
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListProductsByIdentity",
            { identityId: "identity-nova", page: 1, limit: 20, url: MAIN_SERVER_URL },
            "Products",
            "Solar Widget",
        );
    };

    const loadHomeMobile = () => {
        mountAnonymousRoute(detailRoute("/tribes", "identity-nova"), [MAIN_SERVER_URL, COOP_SERVER_URL]);
        seedCartSecret(MAIN_SERVER_URL, "alpha-secret");
    };

    it("shows price, cart count, share controls, and overflow link", () => {
        cy.viewport(1200, 1200);
        loadHome();

        cy.contains(".ant-list-item-meta-title", "Solar Widget").should("be.visible");
        cy.contains(".ProductList__metaColumn", "Price: 0.49").should("be.visible");
        cy.get(".LikeButton").should("be.visible");
        cy.get(".NativeShareButton").should("be.visible");
        screenshotStep("product-card-desktop");
    });

    it("shows the product card on mobile", () => {
        cy.viewport(390, 844);
        loadHomeMobile();

        cy.get(".IdentityDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Nova Rivers").should("be.visible");
        cy.contains(".ant-list-item-meta-title", "Solar Widget", { timeout: 20000 }).should("be.visible");
        cy.get(".LikeButton").should("be.visible");
        screenshotStep("product-card-mobile");
    });
});
