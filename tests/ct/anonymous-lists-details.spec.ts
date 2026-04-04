import * as React from "react";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import {
    clickVisibleLink,
    clickHeaderLink,
    clickSplashSectionLink,
    goHome,
    resetMockScenario,
    waitForCollectionContent,
    waitForDetailContent,
    waitForSplashContent,
    scrollToBottom,
    setMarketplaceEndpoints,
} from "./helpers/marketplace";
import { expectGraphqlRequest } from "./helpers/network";

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
    await mount(React.createElement(Main));
    await goHome(page);
});

test("anonymous users can reach every list page and load more results", async ({ page, network }) => {
    const listPages = [
        {
            label: "Jobs",
            open: async () => clickHeaderLink(page, "Jobs"),
            operationName: "ListJobs",
            title: "Jobs",
            url: /\/jobs$/,
        },
        {
            label: "Products / Services",
            open: async () => clickHeaderLink(page, "Market"),
            operationName: "ListProducts",
            title: "Products / Services",
            url: /\/products-services$/,
        },
        {
            label: "Companies",
            open: async () => clickHeaderLink(page, "Companies"),
            operationName: "ListCompanies",
            title: "Companies",
            url: /\/companies$/,
        },
        {
            label: "Ventures",
            open: async () => clickHeaderLink(page, "Ventures"),
            operationName: "ListStartups",
            title: "Ventures",
            url: /\/ventures$/,
        },
        {
            label: "Tribes",
            open: async () => clickHeaderLink(page, "Tribes"),
            operationName: "ListIdentities",
            title: "Tribes",
            url: /\/tribes$/,
        },
    ];

    for (const listPage of listPages) {
        await goHome(page);
        await waitForSplashContent(page);
        await listPage.open();
        await expect(page).toHaveURL(listPage.url);
        await waitForCollectionContent(page);
        await expect(page.locator(".AppList__title")).toHaveText(listPage.title);
        await expectGraphqlRequest(network.graphqlRequests, listPage.operationName);

        if (listPage.label === "Tribes") {
            await expect.poll(async () => {
                return page.locator(".IdentityList__title").count();
            }).toBeGreaterThan(20);
            continue;
        }

        const items = page.locator(".InfinityScroll .ant-list-item");
        const initialCount = await items.count();
        await scrollToBottom(page);
        await expectGraphqlRequest(network.graphqlRequests, listPage.operationName, (request) => {
            return Number(request.variables.page) === 2;
        });
        await expect.poll(async () => {
            return items.count();
        }).toBeGreaterThan(initialCount);
    }
});

test("anonymous users can reach each detail page and see sub-pagination landmarks", async ({ page, network }) => {
    await goHome(page);
    await waitForSplashContent(page);

    await clickSplashSectionLink(page, "Jobs");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Dense Job 1");
    await waitForDetailContent(page);
    await expect(page.locator(".JobDetail__title")).toContainText("Dense Job 1");
    await expect(page.locator(".EntityCommentsSection")).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "JobById");

    await goHome(page);
    await waitForSplashContent(page);
    await clickSplashSectionLink(page, "Products / Services");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Dense Ethereum Bundle A");
    await waitForDetailContent(page);
    await expect(page.locator(".ProductDetail__purchaseSection")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buy now" })).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "ProductById");

    await goHome(page);
    await waitForSplashContent(page);
    await clickSplashSectionLink(page, "Companies");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Dense Payment Hub");
    await waitForDetailContent(page);
    await expect(page.locator(".CompanyDetail__header")).toBeVisible();
    await page.getByRole("tab", { name: /Jobs/i }).click();
    await waitForCollectionContent(page);
    const companyJobs = page.locator(".InfinityScroll .ant-list-item");
    await expect(companyJobs.first()).toBeVisible();
    const companyJobsInitialCount = await companyJobs.count();
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await expect.poll(async () => {
        return companyJobs.count();
    }).toBeGreaterThan(companyJobsInitialCount);
    await expectGraphqlRequest(network.graphqlRequests, "CompanyById");
    await expectGraphqlRequest(network.graphqlRequests, "ListJobsByCompany");

    await goHome(page);
    await waitForSplashContent(page);
    await clickSplashSectionLink(page, "Ventures");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Dense Venture 1");
    await waitForDetailContent(page);
    await expect(page.locator(".StartupDetail__header")).toBeVisible();
    await expect(page.locator(".EntityCommentsSection")).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "StartupById");

    await goHome(page);
    await waitForSplashContent(page);
    await clickSplashSectionLink(page, "Tribes");
    await waitForCollectionContent(page);
    await clickVisibleLink(page, "Syndicate Network");
    await waitForDetailContent(page);
    await expect(page.locator(".IdentityDetail")).toBeVisible();
    await expect(page.locator(".SplashEntityCard__moreLink")).toHaveCount(4);
    await page.locator(".SplashEntityCard__moreLink").first().click();
    await expect(page).toHaveURL(/\/companies\?tribe=beta-identity-network/);
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
    await expectGraphqlRequest(network.graphqlRequests, "IdentityById");
    await expectGraphqlRequest(network.graphqlRequests, "ListCompaniesByIdentity");
});
