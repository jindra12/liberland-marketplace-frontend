import { activeFixtures, resetGraphQLMock } from "../support/graphqlMock/runtimeState";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../src/generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../src/constants";

import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { screenshotStep } from "../support/component-tests/utils";
import { mountAnonymousRoute, waitForCollectionQuery, waitForDetailQuery } from "../support/component-tests/utils";

const openMoonLampDetail = () => {
    mountAnonymousRoute(detailRoute("/products-services", "product-moon-lamp"), [MAIN_SERVER_URL]);
    waitForDetailQuery(
        MAIN_SERVER_URL,
        "ProductById",
        { id: "product-moon-lamp" },
        "Product",
        "product-moon-lamp",
        "Moon Lamp",
    );
};

const originalMoonLampParameters = structuredClone(
    activeFixtures.products.find((entry) => entry.id === "product-moon-lamp")?.parameters,
);
const originalMoonLampRelatedProducts = structuredClone(
    activeFixtures.products.find((entry) => entry.id === "product-moon-lamp")?.relatedProducts,
);

const getMoonLampFixture = () => {
    const product = activeFixtures.products.find((entry) => entry.id === "product-moon-lamp");
    if (product === undefined) {
        throw new Error("Missing product-moon-lamp fixture data");
    }

    return product;
};

const getSolarWidgetFixture = () => {
    const product = activeFixtures.products.find((entry) => entry.id === "product-solar-widget");
    if (product === undefined) {
        throw new Error("Missing solar widget fixture data");
    }

    return product;
};

const getHarborPackFixture = () => {
    const product = activeFixtures.products.find((entry) => entry.id === "product-harbor-pack");
    if (product === undefined) {
        throw new Error("Missing harbor pack fixture data");
    }

    return product;
};

if (originalMoonLampParameters === undefined || originalMoonLampRelatedProducts === undefined) {
    throw new Error("Missing product fixture data");
}

describe("product/service detail", () => {
    beforeEach(() => {
        resetGraphQLMock();
        cy.viewport(1200, 1200);
    });

    it("shows title, company identity, pricing, properties, links, subscribe, and comments", () => {
        const product = getMoonLampFixture();

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
        cy.then(() => {
            product.parameters = structuredClone(originalMoonLampParameters);
        });
    });

    it("shows related products with product pictures", () => {
        const product = getMoonLampFixture();
        product.relatedProducts = [getSolarWidgetFixture(), getHarborPackFixture()];

        openMoonLampDetail();

        cy.contains(".ProductDetail", "Related products").should("be.visible");
        cy.get(".ProductDetail .SplashEntityCard__avatar").should("have.length.at.least", 1);
        cy.get(".ProductDetail .SplashEntityCard__itemCard").should("have.length.at.least", 3);
        cy.contains(".ProductDetail", "Solar Widget").should("exist");
        cy.contains(".ProductDetail", "Harbor Pack").should("exist");
        screenshotStep("product-detail-related-products-carousel");
        cy.then(() => {
            product.relatedProducts = structuredClone(originalMoonLampRelatedProducts);
        });
    });
});
