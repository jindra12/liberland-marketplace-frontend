import { activeFixtures, resetGraphQLMock } from "../support/graphqlMock/runtimeState";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { screenshotStep } from "../support/component-tests/utils";
import {
    mountMainRoute,
    waitForCollectionQuery,
    waitForDetailQuery,
} from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

const seedNsfwConsent = () => {
    cy.window().then((win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
};

const openMoonLampDetail = () => {
    mountMainRoute(detailRoute("/products-services", "product-moon-lamp"));
    waitForDetailQuery(
        MAIN_SERVER_URL,
        "ProductById",
        { id: "product-moon-lamp" },
        "Product",
        "product-moon-lamp",
        "Moon Lamp",
    );
};

describe("product/service detail", () => {
    beforeEach(() => {
        resetGraphQLMock();
        cy.viewport(1200, 1200);
        seedNsfwConsent();
    });

    it("shows title, company identity, pricing, properties, links, subscribe, and comments", () => {
        const product = activeFixtures.products.find((entry) => entry.id === "product-moon-lamp");
        if (product === undefined) {
            throw new Error("Missing product-moon-lamp fixture data");
        }

        product.parameters = [
            {
                id: "product-moon-lamp-parameter-size",
                name: "Size",
                values: [
                    { id: "product-moon-lamp-size-small", key: "small", name: "Small", default: true },
                    { id: "product-moon-lamp-size-xl", key: "xl", name: "XL", default: false },
                ],
            },
            {
                id: "product-moon-lamp-parameter-color",
                name: "Color",
                values: [
                    { id: "product-moon-lamp-color-white", key: "white", name: "White", default: true },
                    { id: "product-moon-lamp-color-blue", key: "blue", name: "Blue", default: false },
                ],
            },
        ];

        openMoonLampDetail();
        waitForCollectionQuery(
            MAIN_SERVER_URL,
            "ListCommentsByTarget",
            {
                limit: 20,
                page: 1,
                relationTo: COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Products],
                targetId: "product-moon-lamp",
                url: MAIN_SERVER_URL,
            },
            "Comments",
            "Harbor Labs has strong logistics.",
        );

        cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
        cy.contains(".EntityDetail__title", "Moon Lamp").should("be.visible");
        cy.get(".ProductDetail__identityRow").should("be.visible");
        cy.get(".ProductDetail__purchaseMeta").contains("Price: 1.25").should("be.visible");
        cy.get(".ProductDetail__purchaseMeta").contains("Inventory: 7").should("be.visible");
        cy.contains(".Markdown", "Limited stock desk lamp").should("be.visible");
        cy.get(".ant-descriptions").contains("theme").should("be.visible");
        cy.get(".ant-descriptions").contains("night").should("be.visible");
        cy.contains(".ProductDetail", "Visit Website").should("be.visible");
        cy.contains(".ProductDetail", "View company").should("be.visible");
        cy.contains(".ProductDetail", "Add to cart").should("be.visible");
        cy.get(".ProductDetail .AddToCartButton__parametersDivider").should("be.visible");
        cy.get(".ProductDetail .ProductParameterSelector__card").should("have.length", 2);
        cy.contains(".ProductParameterSelector__label", "Size").should("be.visible");
        cy.contains(".ProductParameterSelector__label", "Color").should("be.visible");
        cy.get(".ProductDetail .ProductParameterSelector__select").eq(0).click();
        cy.contains(".ant-select-item-option-content", "XL").click({ force: true });
        cy.get(".ProductDetail .ProductParameterSelector__select").eq(0).should("contain", "XL");
        cy.get(".ProductDetail .ProductParameterSelector__select").eq(1).click();
        cy.contains(".ant-select-item-option-content", "Blue").click({ force: true });
        cy.get(".ProductDetail .ProductParameterSelector__select").eq(1).should("contain", "Blue");
        cy.get(".ShareSection").should("be.visible");
        cy.contains(".ShareSection", "Share this product").should("not.exist");
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".SubscribeButton").should("be.visible").and("contain", "Subscribe");
        cy.contains(".EntityCommentsSection", "Harbor Labs has strong logistics.").should("be.visible");
    });

    it("shows related products with product pictures", () => {
        const product = activeFixtures.products.find((entry) => entry.id === "product-moon-lamp");
        const solarWidget = activeFixtures.products.find((entry) => entry.id === "product-solar-widget");
        const harborPack = activeFixtures.products.find((entry) => entry.id === "product-harbor-pack");

        if (product === undefined || solarWidget === undefined || harborPack === undefined) {
            throw new Error("Missing related products fixture data");
        }

        product.relatedProducts = [solarWidget, harborPack];

        openMoonLampDetail();

        cy.contains(".ProductDetail", "Related products", { timeout: 20000 }).should("be.visible");
        cy.get(".ProductDetail .SplashEntityCard__avatar").should("have.length.at.least", 1);
        cy.get(".ProductDetail .SplashEntityCard__itemCard").should("have.length.at.least", 3);
        cy.contains(".ProductDetail", "Solar Widget").should("exist");
        cy.contains(".ProductDetail", "Harbor Pack").should("exist");
        screenshotStep("product-detail-related-products-carousel");
    });
});
