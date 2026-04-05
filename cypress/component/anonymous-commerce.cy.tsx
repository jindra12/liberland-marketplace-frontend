import * as React from "react";

import { mount } from "cypress/react";

import type { RecordedGraphqlRequest } from "../support/network";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "../support/constants";
import {
    CT_TIMEOUT_MS,
    clickHeaderLink,
    clickVisibleLink,
    goHome,
    navigateToPath,
    resetMockScenario,
    setInitialPath,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForSplashContent,
} from "../support/marketplace";
import { createRequestRecorder, expectGraphqlRequest, isJsonObject } from "../support/network";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

describe("anonymous commerce", () => {
    let network: ReturnType<typeof createRequestRecorder>;

    beforeEach(() => {
        network = createRequestRecorder();
        cy.intercept("POST", "**/api/graphql", (req) => {
            network.recordRequest(req);
        });
        resetMockScenario(alphaUrl);
        resetMockScenario(betaUrl, "pagination");
        setMarketplaceEndpoints([
            {
                enabled: true,
                name: "Main",
                value: betaUrl,
            },
            {
                enabled: true,
                name: "Alpha Mock Market",
                value: alphaUrl,
            },
        ]);
        setInitialPath("/");
        mount(<Main />);
        goHome();
        waitForSplashContent();
    });

    const openProductFromMarket = (productName: string, expectPurchaseControl = true) => {
        clickHeaderLink("Market");
        cy.location("pathname", { timeout: CT_TIMEOUT_MS }).should("eq", "/products-services");
        waitForCollectionContent();
        cy.get(".InfinityScroll .ant-list-item").first().should("be.visible");
        clickVisibleLink(productName);
        cy.location("pathname", { timeout: CT_TIMEOUT_MS }).should("match", /\/products-services\/[^/]+$/);
        cy.get(".ProductDetail__purchaseSection", { timeout: CT_TIMEOUT_MS }).should("be.visible");
        cy.get(".ProductDetail .EntityDetail__title").should("have.text", productName);
        if (expectPurchaseControl) {
            cy.contains("button", "Buy", { timeout: CT_TIMEOUT_MS }).should("be.visible");
        }
    };

    const addProductToCart = (productName: string, quantity: number) => {
        openProductFromMarket(productName);
        cy.log(`Fill quantity ${quantity} for ${productName}`);
        cy.get('[role="spinbutton"]').clear().type(String(quantity));
        cy.contains("button", "Buy", { timeout: CT_TIMEOUT_MS }).click();
        cy.window().then((win) => {
            const cartSecrets = JSON.parse(win.localStorage.getItem("cart.secrets") || "[]") as Array<{ secret: string }>;
            expect(cartSecrets.length).to.be.greaterThan(0);
        });
    };

    const fillAnonymousOrderForm = () => {
        cy.contains(".ant-form-item", "Email").find("input").type("anonymous.checkout@example.com");
        cy.contains(".ant-form-item", "First name").find("input").type("Anonymous");
        cy.contains(".ant-form-item", "Last name").find("input").type("Buyer");
        cy.contains(".ant-form-item", "Address line 1").find("input").type("123 Market Street");
        cy.contains(".ant-form-item", "City").find("input").type("Prague");
        cy.contains(".ant-form-item", "Postal code").find("input").type("11000");
        cy.contains(".ant-form-item", "Country").find("input").type("CZ");
    };

    it("anonymous users can buy orderable products and blocked products stay blocked", () => {
        openProductFromMarket("Dense Advisory Locked", false);
        cy.get(".ProductDetail__purchaseControl").should("have.length", 0);
        expectGraphqlRequest(network.graphqlRequests, "ProductById");
        addProductToCart("Dense Ethereum Bundle B", 4);
        navigateToPath("/cart");
        cy.contains("In cart: 4").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "CreateCart");
        expectGraphqlRequest(network.graphqlRequests, "UpdateCart", (request: RecordedGraphqlRequest) => {
            const data = request.variables.data;
            if (!isJsonObject(data) || !Array.isArray(data.items)) {
                return false;
            }

            const items = data.items as Array<{ product?: string; quantity?: number }>;
            return items.some((item) => {
                return isJsonObject(item) && item.product === "beta-product-node" && item.quantity === 4;
            });
        });
    });

    it("anonymous users can reduce a cart quantity in place", () => {
        addProductToCart("Validator Node Kit", 3);
        navigateToPath("/cart");

        cy.contains("In cart: 3").should("be.visible");
        cy.get('[role="spinbutton"]').clear().type("1");
        cy.get(".ant-btn-dangerous").click();
        cy.contains("In cart: 2").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "UpdateCart");
    });

    it("anonymous users can go from product to cart to address to order", () => {
        addProductToCart("Validator Node Kit", 1);
        navigateToPath("/cart");
        cy.contains("button", "Proceed to order").should("be.visible").click();
        cy.contains("h2", "Order").should("be.visible");

        fillAnonymousOrderForm();
        cy.contains("button", "Create order").click();

        cy.contains("Orders submitted. Pay each order using the chain amount below.").should("be.visible");
        cy.contains("Ethereum (ETH)").should("be.visible");
        cy.contains("Amount due:").should("be.visible");
        expectGraphqlRequest(network.graphqlRequests, "CreateOrder", (request: RecordedGraphqlRequest) => {
            const data = request.variables.data;
            return Boolean(
                isJsonObject(data) &&
                    data.customerEmail === "anonymous.checkout@example.com" &&
                    Array.isArray(data.items) &&
                    data.items.length > 0,
            );
        });
    });

    it("anonymous users can split a multi-product cart by server and chain", () => {
        addProductToCart("Dense Ethereum Bundle A", 1);
        goHome();
        waitForSplashContent();
        addProductToCart("Dense Ethereum Bundle B", 1);
        goHome();
        waitForSplashContent();
        addProductToCart("Federation Coffee Crate", 1);
        goHome();
        waitForSplashContent();
        addProductToCart("Orbit Membership", 1);

        navigateToPath("/cart");
        cy.contains("button", "Proceed to order").click();
        fillAnonymousOrderForm();
        cy.contains("button", "Create order").click();

        cy.contains("Orders submitted. Pay each order using the chain amount below.").should("be.visible");
        cy.get(".OrderPage .ant-card-head-title").should("have.length", 2);
        cy.contains("Ethereum (ETH)").should("have.length", 2);
        cy.contains("Solana (SOL)").should("have.length", 1);
        expectGraphqlRequest(network.graphqlRequests, "CreateOrder", (request: RecordedGraphqlRequest) => {
            const data = request.variables.data;
            return Boolean(
                isJsonObject(data) &&
                    Array.isArray(data.items) &&
                    data.items.length === 4 &&
                    isJsonObject(data.shippingAddress),
            );
        });
    });
});
