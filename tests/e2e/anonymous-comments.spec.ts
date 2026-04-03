import type { Page } from "@playwright/test";

import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import { clickHeaderLink, clickVisibleLink, goHome, resetMockScenario, setMarketplaceEndpoints } from "./helpers/marketplace";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

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

const addAnonymousComment = async (page: Page, commentText: string) => {
    await expect(page.locator(".EntityCommentsSection")).toBeVisible();
    await page.getByPlaceholder("Write your comment...").fill(commentText);
    await page.getByRole("button", { name: "Post" }).click();
    await expect(page.getByText(commentText)).toBeVisible();
};

const openProductDetail = async (page: Page, productName: string) => {
    await clickVisibleLink(page, "Explore market");
    await page.waitForURL(/\/products-services(?:\?.*)?$/);
    await clickVisibleLink(page, productName);
    await expect(page.getByRole("heading", { name: productName })).toBeVisible();
};

test("anonymous users can add a comment to a product detail page", async ({ page }) => {
    await openProductDetail(page, "Dense Ethereum Bundle A");
    const commentText = `Playwright product comment ${Date.now()}`;
    await addAnonymousComment(page, commentText);
});

test("anonymous users can add a comment to a company discussion tab", async ({ page }) => {
    await clickHeaderLink(page, "Companies");
    await clickVisibleLink(page, "Dense Payment Hub");
    await page.getByRole("tab", { name: "Discussion" }).click();

    const commentText = `Playwright company comment ${Date.now()}`;
    await addAnonymousComment(page, commentText);
});
