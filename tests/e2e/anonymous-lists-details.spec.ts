import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import {
    clickHeaderLink,
    clickVisibleLink,
    goHome,
    resetMockScenario,
    scrollToBottom,
    setMarketplaceEndpoints,
} from "./helpers/marketplace";

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

test("anonymous users can reach every list page and load more results", async ({ page }) => {
    const listPages = [
        {
            label: "Jobs",
            open: async () => clickHeaderLink(page, "Jobs"),
            title: "Jobs",
        },
        {
            label: "Products / Services",
            open: async () => clickVisibleLink(page, "Explore market"),
            title: "Products / Services",
        },
        {
            label: "Companies",
            open: async () => clickHeaderLink(page, "Companies"),
            title: "Companies",
        },
        {
            label: "Ventures",
            open: async () => clickHeaderLink(page, "Ventures"),
            title: "Ventures",
        },
        {
            label: "Tribes",
            open: async () => clickHeaderLink(page, "Tribes"),
            title: "Tribes",
        },
    ];

    for (const listPage of listPages) {
        await goHome(page);
        await listPage.open();
        await expect(page.getByRole("heading", { name: listPage.title })).toBeVisible();

        if (listPage.label === "Tribes") {
            await expect.poll(async () => {
                return page.locator(".IdentityList__title").count();
            }).toBeGreaterThan(20);
            continue;
        }

        const items = page.locator(".InfinityScroll .ant-list-item");
        const initialCount = await items.count();
        await scrollToBottom(page);
        await expect.poll(async () => {
            return items.count();
        }).toBeGreaterThan(initialCount);
    }
});

test("anonymous users can reach each detail page and see sub-pagination landmarks", async ({ page }) => {
    await goHome(page);

    await clickHeaderLink(page, "Jobs");
    await clickVisibleLink(page, "Dense Job 1");
    await expect(page.locator(".JobDetail__title")).toContainText("Dense Job 1");
    await expect(page.locator(".EntityCommentsSection")).toBeVisible();

    await goHome(page);
    await clickVisibleLink(page, "Explore market");
    await clickVisibleLink(page, "Dense Ethereum Bundle A");
    await expect(page.locator(".ProductDetail__purchaseSection")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buy now" })).toBeVisible();

    await goHome(page);
    await clickHeaderLink(page, "Companies");
    await clickVisibleLink(page, "Dense Payment Hub");
    await expect(page.locator(".CompanyDetail__header")).toBeVisible();
    await page.getByRole("tab", { name: /Jobs/i }).click();
    const companyJobs = page.locator(".InfinityScroll .ant-list-item");
    await expect(companyJobs.first()).toBeVisible();
    const companyJobsInitialCount = await companyJobs.count();
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await expect.poll(async () => {
        return companyJobs.count();
    }).toBeGreaterThan(companyJobsInitialCount);

    await goHome(page);
    await clickHeaderLink(page, "Ventures");
    await clickVisibleLink(page, "Dense Venture 1");
    await expect(page.locator(".StartupDetail__header")).toBeVisible();
    await expect(page.locator(".EntityCommentsSection")).toBeVisible();

    await goHome(page);
    await clickHeaderLink(page, "Tribes");
    await clickVisibleLink(page, "Syndicate Network");
    await expect(page.locator(".IdentityDetail")).toBeVisible();
    await expect(page.locator(".SplashEntityCard__moreLink")).toHaveCount(4);
    await page.locator(".SplashEntityCard__moreLink").first().click();
    await expect(page).toHaveURL(/\/companies\?tribe=beta-identity-network/);
    await expect(page.getByRole("heading", { name: "Companies" })).toBeVisible();
});
