import { expect } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

export const CT_TIMEOUT_MS = 20000;
export const CT_NAVIGATION_TIMEOUT_MS = 45000;
const CT_LOADER_TIMEOUT_MS = 15000;

export type MarketplaceEndpoint = {
    description?: string;
    enabled: boolean;
    name: string;
    value: string;
};

export const setMarketplaceEndpoints = async (page: Page, endpoints: MarketplaceEndpoint[]) => {
    await page.evaluate((storedEndpoints: MarketplaceEndpoint[]) => {
        localStorage.clear();
        localStorage.setItem("endpoints.urls", JSON.stringify(storedEndpoints));
    }, endpoints);
};

export const navigateToPath = async (page: Page, path: string) => {
    await page.evaluate((nextPath: string) => {
        window.history.pushState({}, "", nextPath);
        window.dispatchEvent(new PopStateEvent("popstate"));
    }, path);
};

export const setMockScenario = async (request: APIRequestContext, url: string, scenario: string) => {
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            const response = await request.post(`${url}/__admin/scenario`, {
                data: {
                    scenario,
                },
            });
            if (response.ok()) {
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
    for (let attempt = 1; attempt <= 5; attempt += 1) {
        try {
            const response = await request.post(`${url}/__admin/reset`, {
                data: {
                    scenario,
                },
            });
            if (response.ok()) {
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
    await navigateToPath(page, "/");
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
    await waitForLoaderTransition(page, ".LoadingSkeleton--splashSections");
    await expect(page.locator(".SplashPage__hero")).toBeVisible({ timeout: CT_TIMEOUT_MS });
};

export const waitForCollectionContent = async (page: Page) => {
    await waitForLoaderTransition(page, ".LoadingSkeleton--collection");
    await expect(page.locator(".AppList__title")).toBeVisible({
        timeout: CT_TIMEOUT_MS,
    });
};

export const waitForDetailContent = async (page: Page) => {
    await waitForLoaderTransition(page, ".LoadingSkeleton--detail");
    await expect(
        page.locator(".EntityDetail__title, .JobDetail__title, .StartupDetail__title").first(),
    ).toHaveText(/.+/, { timeout: CT_TIMEOUT_MS });
};

export const openAppMenu = async (page: Page) => {
    const openMenuButton = page.getByRole("button", { name: "Open menu" });
    if (await openMenuButton.count()) {
        await openMenuButton.click();
        await expect(page.locator(".AppHeader__desktopDrawerNav")).toBeVisible({
            timeout: CT_TIMEOUT_MS,
        });
        return;
    }

    const openNavigationButton = page.getByRole("button", { name: "Open navigation" });
    if (await openNavigationButton.count()) {
        await openNavigationButton.click();
        await expect(page.locator(".AppHeader__drawerBody")).toBeVisible({
            timeout: CT_TIMEOUT_MS,
        });
    }
};

export const clickHeaderLink = async (page: Page, label: string) => {
    const headerLink = page.locator(".AppHeader__menuLink").filter({ hasText: label }).first();
    if ((await headerLink.count()) > 0) {
        await headerLink.click();
        return;
    }

    await openAppMenu(page);
    await page.locator(".AppHeader__drawerMenuLink").filter({ hasText: label }).first().click();
};

export const clickVisibleLink = async (page: Page, label: string) => {
    const link = page.getByRole("link", { name: label });
    await link.click({ force: true });
};

export const clickSplashSectionLink = async (page: Page, label: string) => {
    const link = page.locator(".SplashEntityCard__titleLink").filter({ hasText: label }).first();
    await expect(link).toBeVisible({ timeout: CT_TIMEOUT_MS });
    await link.click();
};

export const scrollToBottom = async (page: Page) => {
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
};

export const openSyndicationPage = async (page: Page) => {
    await openAppMenu(page);
    const drawerNavs = page.locator(".AppHeader__drawerNav, .AppHeader__desktopDrawerNav");
    const syndicationLink = drawerNavs.getByRole("link", { name: "Syndication" }).first();
    if (await syndicationLink.count()) {
        await syndicationLink.click();
        return;
    }

    await page.locator(".SplashPage__syndicationManageBtn").click();
};
