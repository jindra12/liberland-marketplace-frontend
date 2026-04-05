import { expect } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

export const CT_TIMEOUT_MS = 5000;
export const CT_NAVIGATION_TIMEOUT_MS = 45000;
const CT_LOADER_TIMEOUT_MS = 5000;

export const logTestStep = (message: string) => {
    console.log(`[ct] ${message}`);
};

export type MarketplaceEndpoint = {
    description?: string;
    enabled: boolean;
    name: string;
    value: string;
};

export const setMarketplaceEndpoints = async (page: Page, endpoints: MarketplaceEndpoint[]) => {
    logTestStep("Set marketplace endpoints");
    await page.evaluate((storedEndpoints: MarketplaceEndpoint[]) => {
        localStorage.clear();
        localStorage.setItem("endpoints.urls", JSON.stringify(storedEndpoints));
    }, endpoints);
    logTestStep("Finished setting marketplace endpoints");
};

export const navigateToPath = async (page: Page, path: string) => {
    logTestStep(`Navigate to ${path}`);
    await page.evaluate((nextPath: string) => {
        window.history.pushState({}, "", nextPath);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, path);
    logTestStep(`Finished navigating to ${path}`);
};

export const setMockScenario = async (request: APIRequestContext, url: string, scenario: string) => {
    logTestStep(`Set mock scenario ${scenario} for ${url}`);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            const response = await request.post(`${url}/__admin/scenario`, {
                data: {
                    scenario,
                },
            });
            if (response.ok()) {
                logTestStep(`Finished setting mock scenario ${scenario} for ${url}`);
                return;
            }
        } catch {
            if (attempt < 5) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });
                continue;
            }
        }

        if (attempt < 5) {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            continue;
        }

        throw new Error(`Could not switch ${url} to scenario ${scenario}`);
    }
};

export const resetMockScenario = async (request: APIRequestContext, url: string, scenario = "default") => {
    logTestStep(`Reset mock scenario ${scenario} for ${url}`);
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            const response = await request.post(`${url}/__admin/reset`, {
                data: {
                    scenario,
                },
            });
            if (response.ok()) {
                logTestStep(`Finished resetting mock scenario ${scenario} for ${url}`);
                return;
            }
        } catch {
            if (attempt < 5) {
                await new Promise((resolve) => {
                    setTimeout(resolve, 1000);
                });
                continue;
            }
        }

        if (attempt < 5) {
            await new Promise((resolve) => {
                setTimeout(resolve, 1000);
            });
            continue;
        }

        throw new Error(`Could not reset ${url} to scenario ${scenario}`);
    }
};

export const goHome = async (page: Page) => {
    logTestStep("Go home");
    await navigateToPath(page, "/");
    logTestStep("Finished going home");
};

const waitForLoaderTransition = async (page: Page, selector: string) => {
    const loader = page.locator(selector);
    const appeared = await expect(loader).toBeVisible({ timeout: CT_LOADER_TIMEOUT_MS }).then(() => true).catch(() => false);
    if (!appeared) {
        return;
    }

    await expect(loader).toBeHidden({ timeout: CT_TIMEOUT_MS });
};

export const waitForSplashContent = async (page: Page) => {
    logTestStep("Wait for splash content");
    await waitForLoaderTransition(page, ".LoadingSkeleton--splashSections");
    await expect(page.locator(".SplashPage__hero")).toBeVisible({ timeout: CT_TIMEOUT_MS });
    logTestStep("Finished waiting for splash content");
};

export const waitForCollectionContent = async (page: Page) => {
    logTestStep("Wait for collection content");
    await waitForLoaderTransition(page, ".LoadingSkeleton--collection");
    await expect(page.locator(".AppList__title")).toBeVisible({
        timeout: CT_TIMEOUT_MS,
    });
    logTestStep("Finished waiting for collection content");
};

export const waitForDetailContent = async (page: Page) => {
    logTestStep("Wait for detail content");
    await waitForLoaderTransition(page, ".LoadingSkeleton--detail");
    await expect(
        page.locator(".EntityDetail__title, .JobDetail__title, .StartupDetail__title").first(),
    ).toHaveText(/.+/, { timeout: CT_TIMEOUT_MS });
    logTestStep("Finished waiting for detail content");
};

export const openAppMenu = async (page: Page) => {
    logTestStep("Open app menu");
    const openMenuButton = page.getByRole("button", { name: "Open menu" });
    if (await openMenuButton.count()) {
        await openMenuButton.click();
        await expect(page.locator(".AppHeader__desktopDrawerNav")).toBeVisible({
            timeout: CT_TIMEOUT_MS,
        });
        logTestStep("Finished opening app menu");
        return;
    }

    const openNavigationButton = page.getByRole("button", { name: "Open navigation" });
    if (await openNavigationButton.count()) {
        await openNavigationButton.click();
        await expect(page.locator(".AppHeader__drawerBody")).toBeVisible({
            timeout: CT_TIMEOUT_MS,
        });
    }

    logTestStep("Finished opening app menu");
};

export const clickHeaderLink = async (page: Page, label: string) => {
    logTestStep(`Click header link ${label}`);
    const headerLink = page.locator(".AppHeader__menuLink").filter({ hasText: label }).first();
    if ((await headerLink.count()) > 0) {
        await headerLink.click();
        logTestStep(`Finished clicking header link ${label}`);
        return;
    }

    await openAppMenu(page);
    await page.locator(".AppHeader__drawerMenuLink").filter({ hasText: label }).first().click();
    logTestStep(`Finished clicking header link ${label}`);
};

export const clickVisibleLink = async (page: Page, label: string) => {
    logTestStep(`Click visible link ${label}`);
    const link = page.getByRole("link", { name: label });
    await link.click({ force: true });
    logTestStep(`Finished clicking visible link ${label}`);
};

export const clickSplashSectionLink = async (page: Page, label: string) => {
    logTestStep(`Click splash section link ${label}`);
    const link = page.locator(".SplashEntityCard__titleLink").filter({ hasText: label }).first();
    await expect(link).toBeVisible({ timeout: CT_TIMEOUT_MS });
    await link.click();
    logTestStep(`Finished clicking splash section link ${label}`);
};

export const scrollToBottom = async (page: Page) => {
    logTestStep("Scroll to bottom");
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await page.keyboard.press("End");
    await page.evaluate(() => {
        const scrollTarget = document.querySelector(".InfinityScroll") as HTMLElement | null;
        const infiniteScrollComponent = document.querySelector(".infinite-scroll-component") as HTMLElement | null;
        const root = document.scrollingElement || document.documentElement;
        const bottom = Math.max(0, root.scrollHeight - window.innerHeight);

        if (scrollTarget) {
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
            scrollTarget.dispatchEvent(new Event("scroll", { bubbles: true }));
        }

        if (infiniteScrollComponent) {
            infiniteScrollComponent.scrollTop = infiniteScrollComponent.scrollHeight;
            infiniteScrollComponent.dispatchEvent(new Event("scroll", { bubbles: true }));
        }

        root.scrollTop = bottom;
        window.scrollTo(0, bottom);
        root.dispatchEvent(new Event("scroll"));
        document.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(500);
    logTestStep("Finished scrolling to bottom");
};

export const openSyndicationPage = async (page: Page) => {
    logTestStep("Open syndication page");
    await openAppMenu(page);
    const drawerNavs = page.locator(".AppHeader__drawerNav, .AppHeader__desktopDrawerNav");
    const syndicationLink = drawerNavs.getByRole("link", { name: "Syndication" }).first();
    if (await syndicationLink.count()) {
        await syndicationLink.click();
        logTestStep("Finished opening syndication page");
        return;
    }

    await page.locator(".SplashPage__syndicationManageBtn").click();
    logTestStep("Finished opening syndication page");
};
