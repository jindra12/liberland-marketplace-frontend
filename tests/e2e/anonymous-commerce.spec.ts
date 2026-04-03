import type { Page } from "@playwright/test";

import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import { goHome, resetMockScenario, setMarketplaceEndpoints } from "./helpers/marketplace";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

const PRODUCT_PATHS: Record<string, string> = {
    "Dense Advisory Locked": "/products-services/dense-product-locked",
    "Dense Ethereum Bundle A": "/products-services/dense-product-eth-1",
    "Dense Ethereum Bundle B": "/products-services/dense-product-eth-2",
    "Federation Coffee Crate": "/products-services/alpha-product-coffee",
    "Orbit Membership": "/products-services/beta-product-membership",
    "Validator Node Kit": "/products-services/beta-product-node",
};

test.describe.configure({ mode: "serial" });

test.beforeEach(async ({ page, request }) => {
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
    await goHome(page);
});

const openProductFromMarket = async (page: Page, productName: string, expectPurchaseControl = true) => {
    await page.goto(PRODUCT_PATHS[productName], {
        waitUntil: "domcontentloaded",
    });
    await page.locator(".ProductDetail").waitFor({
        state: "visible",
        timeout: 60000,
    });
    if (expectPurchaseControl) {
        await page.getByRole("button", { name: "Buy" }).waitFor({
            state: "visible",
            timeout: 60000,
        });
    }
};

const addProductToCart = async (page: Page, productName: string, quantity: number) => {
    await openProductFromMarket(page, productName);
    await page.getByRole("spinbutton").fill(String(quantity));
    await page.getByRole("button", { name: "Buy" }).click();
    await expect(page.getByText(`In cart: ${quantity}`)).toBeVisible();
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

test("anonymous users can buy orderable products and blocked products stay blocked", async ({ page }) => {
    await openProductFromMarket(page, "Dense Advisory Locked", false);
    await expect(page.locator(".ProductDetail__purchaseControl")).toHaveCount(0);

    await goHome(page);
    await addProductToCart(page, "Dense Ethereum Bundle B", 10);
    await expect(page.getByText("In cart: 4")).toBeVisible();
});

test("anonymous users can reduce a cart quantity in place", async ({ page }) => {
    await addProductToCart(page, "Validator Node Kit", 3);
    await page.getByRole("link", { name: "Cart" }).click();

    await expect(page.getByText("In cart: 3")).toBeVisible();
    await page.getByRole("spinbutton").fill("1");
    await page.locator(".ant-btn-dangerous").click();
    await expect(page.getByText("In cart: 2")).toBeVisible();
});

test("anonymous users can go from product to cart to address to order", async ({ page }) => {
    await addProductToCart(page, "Validator Node Kit", 1);
    await page.getByRole("link", { name: "Cart" }).click();
    await expect(page.getByRole("button", { name: "Proceed to order" })).toBeVisible();
    await page.getByRole("button", { name: "Proceed to order" }).click();

    await expect(page.getByRole("heading", { name: "Order" })).toBeVisible();
    await fillAnonymousOrderForm(page);
    await page.getByRole("button", { name: "Create order" }).click();

    await expect(page.getByText("Orders submitted. Pay each order using the chain amount below.")).toBeVisible();
    await expect(page.getByText("Ethereum (ETH)")).toBeVisible();
    await expect(page.getByText("Amount due:")).toBeVisible();
});

test("anonymous users can split a multi-product cart by server and chain", async ({ page }) => {
    await addProductToCart(page, "Dense Ethereum Bundle A", 1);
    await goHome(page);
    await addProductToCart(page, "Dense Ethereum Bundle B", 1);
    await goHome(page);
    await addProductToCart(page, "Federation Coffee Crate", 1);
    await goHome(page);
    await addProductToCart(page, "Orbit Membership", 1);

    await page.getByRole("link", { name: "Cart" }).click();
    await page.getByRole("button", { name: "Proceed to order" }).click();
    await fillAnonymousOrderForm(page);
    await page.getByRole("button", { name: "Create order" }).click();

    await expect(page.getByText("Orders submitted. Pay each order using the chain amount below.")).toBeVisible();
    await expect(page.locator(".OrderPage .ant-card-head-title")).toHaveCount(2);
    await expect(page.getByText("Ethereum (ETH)")).toHaveCount(2);
    await expect(page.getByText("Solana (SOL)")).toHaveCount(1);
});
