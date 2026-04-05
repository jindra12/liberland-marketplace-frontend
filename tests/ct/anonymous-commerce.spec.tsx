import * as React from "react";

import type { Page } from "@playwright/test";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import {
    clickVisibleLink,
    clickHeaderLink,
    goHome,
    logTestStep,
    navigateToPath,
    resetMockScenario,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForSplashContent,
    CT_TIMEOUT_MS,
} from "./helpers/marketplace";
import { expectGraphqlRequest, isJsonObject } from "./helpers/network";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page, request, mount }) => {
    await resetMockScenario(request, alphaUrl);
    await resetMockScenario(request, betaUrl, "pagination");
    await setMarketplaceEndpoints(page, [
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
    await page.evaluate(() => {
        window.history.replaceState({}, "", "/");
    });
    await mount(<Main />);
    await goHome(page);
    await waitForSplashContent(page);
});

const openProductFromMarket = async (page: Page, productName: string, expectPurchaseControl = true) => {
    await clickHeaderLink(page, "Market");
    await page.waitForURL(/\/products-services$/, {
        timeout: CT_TIMEOUT_MS,
    });
    await waitForCollectionContent(page);
    await expect(page.locator(".InfinityScroll .ant-list-item").first()).toBeVisible({ timeout: CT_TIMEOUT_MS });
    await clickVisibleLink(page, productName);
    logTestStep(`Current URL after clicking ${productName}: ${page.url()}`);
    logTestStep(`Wait for product detail URL ${productName}`);
    await page.waitForURL(/\/products-services\/[^/]+/, {
        timeout: CT_TIMEOUT_MS,
    });
    logTestStep(`Finished waiting for product detail URL ${productName}`);
    await expect(page.locator(".ProductDetail__purchaseSection")).toBeVisible({ timeout: CT_TIMEOUT_MS });
    await expect(page.locator(".ProductDetail .EntityDetail__title")).toHaveText(productName);
    if (expectPurchaseControl) {
        await expect(page.locator(".ProductDetail__purchaseSection")).toBeVisible();
        await expect(page.getByRole("button", { name: "Buy", exact: true })).toBeVisible();
    }
};

const addProductToCart = async (page: Page, productName: string, quantity: number) => {
    logTestStep(`Add product ${productName}`);
    await openProductFromMarket(page, productName);
    logTestStep(`Fill quantity ${quantity} for ${productName}`);
    await page.getByRole("spinbutton").fill(String(quantity));
    logTestStep(`Click Buy for ${productName}`);
    await page.getByRole("button", { name: "Buy", exact: true }).click();
    logTestStep(`Cart secrets after buying ${productName}: ${await page.evaluate(() => localStorage.getItem("cart.secrets"))}`);
    logTestStep(`Wait for cart secrets after adding ${productName}`);
    await page.waitForFunction(() => {
        try {
            return JSON.parse(localStorage.getItem("cart.secrets") || "[]").length > 0;
        } catch {
            return false;
        }
    }, undefined, {
        timeout: CT_TIMEOUT_MS,
    });
    logTestStep(`Finished adding ${productName}`);
};

const fillAnonymousOrderForm = async (page: Page) => {
    await page.getByLabel("Email").fill("anonymous.checkout@example.com");
    await page.getByLabel("First name").fill("Anonymous");
    await page.getByLabel("Last name").fill("Buyer");
    await page.getByLabel("Address line 1").fill("123 Market Street");
    await page.getByLabel("City").fill("Prague");
    await page.getByLabel("Postal code").fill("11000");
    await page.getByLabel("Country").fill("CZ");
};

test("anonymous users can buy orderable products and blocked products stay blocked", async ({ page, network }) => {
    await openProductFromMarket(page, "Dense Advisory Locked", false);
    await expect(page.locator(".ProductDetail__purchaseControl")).toHaveCount(0);
    await expectGraphqlRequest(network.graphqlRequests, "ProductById");
    await addProductToCart(page, "Dense Ethereum Bundle B", 4);
    await navigateToPath(page, "/cart");
    await expect(page.getByText("In cart: 4")).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "CreateCart");
    await expectGraphqlRequest(network.graphqlRequests, "UpdateCart", (request) => {
        const data = request.variables.data;
        return Boolean(
            isJsonObject(data) &&
                Array.isArray(data.items) &&
                data.items.some((item) => {
                    return isJsonObject(item) && item.product === "beta-product-node" && item.quantity === 4;
                }),
        );
    });
});

test("anonymous users can reduce a cart quantity in place", async ({ page, network }) => {
    await addProductToCart(page, "Validator Node Kit", 3);
    await navigateToPath(page, "/cart");

    await expect(page.getByText("In cart: 3")).toBeVisible();
    await page.getByRole("spinbutton").fill("1");
    await page.locator(".ant-btn-dangerous").click();
    await expect(page.getByText("In cart: 2")).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "UpdateCart");
});

test("anonymous users can go from product to cart to address to order", async ({ page, network }) => {
    await addProductToCart(page, "Validator Node Kit", 1);
    await navigateToPath(page, "/cart");
    await expect(page.getByRole("button", { name: "Proceed to order" })).toBeVisible();
    await page.getByRole("button", { name: "Proceed to order" }).click();
    await expect(page.getByRole("heading", { name: "Order" })).toBeVisible();

    await fillAnonymousOrderForm(page);
    await page.getByRole("button", { name: "Create order" }).click();

    await expect(page.getByText("Orders submitted. Pay each order using the chain amount below.")).toBeVisible();
    await expect(page.getByText("Ethereum (ETH)")).toBeVisible();
    await expect(page.getByText("Amount due:")).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "CreateOrder", (request) => {
        const data = request.variables.data;
        return Boolean(
            isJsonObject(data) &&
                data.customerEmail === "anonymous.checkout@example.com" &&
                Array.isArray(data.items) &&
                data.items.length > 0,
        );
    });
});

test("anonymous users can split a multi-product cart by server and chain", async ({ page, network }) => {
    await addProductToCart(page, "Dense Ethereum Bundle A", 1);
    await goHome(page);
    await waitForSplashContent(page);
    await addProductToCart(page, "Dense Ethereum Bundle B", 1);
    await goHome(page);
    await waitForSplashContent(page);
    await addProductToCart(page, "Federation Coffee Crate", 1);
    await goHome(page);
    await waitForSplashContent(page);
    await addProductToCart(page, "Orbit Membership", 1);

    await navigateToPath(page, "/cart");
    await page.getByRole("button", { name: "Proceed to order" }).click();
    await fillAnonymousOrderForm(page);
    await page.getByRole("button", { name: "Create order" }).click();

    await expect(page.getByText("Orders submitted. Pay each order using the chain amount below.")).toBeVisible();
    await expect(page.locator(".OrderPage .ant-card-head-title")).toHaveCount(2);
    await expect(page.getByText("Ethereum (ETH)")).toHaveCount(2);
    await expect(page.getByText("Solana (SOL)")).toHaveCount(1);
    await expectGraphqlRequest(network.graphqlRequests, "CreateOrder", (request) => {
        const data = request.variables.data;
        return Boolean(
            isJsonObject(data) &&
                Array.isArray(data.items) &&
                data.items.length === 4 &&
                data.shippingAddress &&
                typeof data.shippingAddress === "object",
        );
    });
});
