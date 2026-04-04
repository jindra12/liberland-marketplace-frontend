import { expect } from "@playwright/test";
import type { APIRequestContext, Page } from "@playwright/test";

export type MarketplaceEndpoint = {
    description?: string;
    enabled: boolean;
    name: string;
    value: string;
};

export const setMarketplaceEndpoints = async (page: Page, endpoints: MarketplaceEndpoint[]) => {
    await page.addInitScript((storedEndpoints: MarketplaceEndpoint[]) => {
        localStorage.clear();
        localStorage.setItem("endpoints.urls", JSON.stringify(storedEndpoints));
    }, endpoints);
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
    await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
    });
};

const waitForLoaderTransition = async (page: Page, selector: string) => {
    const loader = page.locator(selector);
    const appeared = await expect(loader).toBeVisible({ timeout: 4000 }).then(() => true).catch(() => false);
    if (!appeared) {
        return;
    }

    await expect(loader).toBeHidden({ timeout: 60000 });
};

export const waitForSplashContent = async (page: Page) => {
    await waitForLoaderTransition(page, ".LoadingSkeleton--splashSections");
    await expect(page.locator(".SplashEntityCard__titleLink").first()).toBeVisible({ timeout: 60000 });
};

export const waitForCollectionContent = async (page: Page) => {
    await waitForLoaderTransition(page, ".LoadingSkeleton--collection");
    await expect(page.locator(".InfinityScroll .ant-list-item, .IdentityList__title").first()).toBeVisible({
        timeout: 60000,
    });
};

export const waitForDetailContent = async (page: Page) => {
    await waitForLoaderTransition(page, ".LoadingSkeleton--detail");
    await expect(
        page.locator(".EntityDetail__title, .JobDetail__title, .StartupDetail__title").first(),
    ).toHaveText(/.+/, { timeout: 60000 });
};

export const openAppMenu = async (page: Page) => {
    const openMenuButton = page.getByRole("button", { name: "Open menu" });
    if (await openMenuButton.count()) {
        await openMenuButton.click();
        await expect(page.locator(".AppHeader__desktopDrawer .ant-drawer-content-wrapper")).toBeVisible({
            timeout: 60000,
        });
        return;
    }

    const openNavigationButton = page.getByRole("button", { name: "Open navigation" });
    if (await openNavigationButton.count()) {
        await openNavigationButton.click();
        await expect(page.locator(".AppHeader__drawer .ant-drawer-content-wrapper")).toBeVisible({
            timeout: 60000,
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
    await expect(link).toBeVisible({ timeout: 60000 });
    await link.click();
};

export const scrollToBottom = async (page: Page) => {
    await page.locator("body").click({ position: { x: 10, y: 10 } });
    await page.keyboard.press("End");
    for (let index = 0; index < 5; index += 1) {
        await page.mouse.wheel(0, 4000);
        await page.waitForTimeout(100);
    }
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
    const drawerNav = page.locator(".AppHeader__drawerNav");
    const syndicationLink = drawerNav.getByRole("link", { name: "Syndication" });
    if (await syndicationLink.count()) {
        await syndicationLink.click();
        return;
    }

    await page.getByRole("link", { name: "Manage endpoints" }).click();
};
