import type { Page } from "@playwright/test";

import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import {
    clickHeaderLink,
    clickVisibleLink,
    goHome,
    resetMockScenario,
    setMarketplaceEndpoints,
    waitForCollectionContent,
    waitForDetailContent,
    waitForSplashContent,
} from "./helpers/marketplace";
import { expectGraphqlRequest, isJsonObject } from "./helpers/network";

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
    await waitForSplashContent(page);
});

const addAnonymousComment = async (page: Page, commentText: string) => {
    const commentsSection = page.locator(".EntityCommentsSection");
    await expect(commentsSection).toBeVisible();
    await commentsSection.getByPlaceholder("Write your comment...").fill(commentText);
    await commentsSection.getByRole("button", { name: "Post" }).click();
    await expect(commentsSection).toContainText(commentText, { timeout: 60000 });
};

const openProductDetail = async (page: Page, productName: string) => {
    await clickVisibleLink(page, "Explore market");
    await page.waitForURL(/\/products-services(?:\?.*)?$/);
    await waitForCollectionContent(page);
    await clickVisibleLink(page, productName);
    await waitForDetailContent(page);
    await expect(page.locator(".ProductDetail .EntityDetail__title")).toHaveText(productName);
};

test("anonymous users can add a comment to a product detail page", async ({ page, network }) => {
    await openProductDetail(page, "Dense Ethereum Bundle A");
    const commentText = `Playwright product comment ${Date.now()}`;
    await addAnonymousComment(page, commentText);
    await expectGraphqlRequest(network.graphqlRequests, "CreateComment", (request) => {
        const data = request.variables.data;
        return Boolean(isJsonObject(data) && data.content === commentText);
    });
});

test("anonymous users can add a comment to a company discussion tab", async ({ page, network }) => {
    await clickHeaderLink(page, "Companies");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Dense Payment Hub");
    await waitForDetailContent(page);
    await page.getByRole("tab", { name: "Discussion" }).click();

    const commentText = `Playwright company comment ${Date.now()}`;
    await addAnonymousComment(page, commentText);
    await expectGraphqlRequest(network.graphqlRequests, "CreateComment", (request) => {
        const data = request.variables.data;
        return Boolean(isJsonObject(data) && data.content === commentText);
    });
});
