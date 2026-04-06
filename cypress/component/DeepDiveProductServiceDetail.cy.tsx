import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountMainRoute,
    waitForCollectionQuery,
    waitForDetailQuery,
    waitForRouteLoad,
} from "../support/component-tests/utils";

describe("product/service detail", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        mountMainRoute("/products-services/product-moon-lamp");
        waitForRouteLoad(".LoadingSkeleton--detail");
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-moon-lamp" },
            "Product",
            "product-moon-lamp",
            "Moon Lamp",
        );
    });

    it("shows title, company identity, pricing, properties, links, subscribe, and comments", () => {
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 100,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Products],
                targetId: "product-moon-lamp",
            },
            "Comments",
            "Moon Lamp looks sharp on the shelf.",
        );

        cy.get(".ProductDetail").should("be.visible");
        cy.contains(".EntityDetail__title", "Moon Lamp").should("be.visible");
        cy.get(".ProductDetail__identityRow").should("be.visible");
        cy.get(".ProductDetail__purchaseMeta").contains("Price: 1.25").should("be.visible");
        cy.get(".ProductDetail__purchaseMeta").contains("Inventory: 7").should("be.visible");
        cy.contains(".Markdown", "Limited stock desk lamp").should("be.visible");
        cy.get(".ant-descriptions").contains("theme").should("be.visible");
        cy.get(".ant-descriptions").contains("night").should("be.visible");
        cy.contains(".ProductDetail", "Visit Website").should("be.visible");
        cy.contains(".ProductDetail", "View company").should("be.visible");
        cy.get(".ShareSection").should("be.visible").contains("Share this product");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".SubscribeButton").should("be.visible").and("contain", "Subscribe");
        cy.contains(".EntityCommentsSection", "Moon Lamp looks sharp on the shelf.").should("be.visible");
    });
});
