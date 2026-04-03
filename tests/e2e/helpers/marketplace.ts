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
    const response = await request.post(`${url}/__admin/scenario`, {
        data: {
            scenario,
        },
    });
    if (!response.ok()) {
        throw new Error(`Could not switch ${url} to scenario ${scenario}`);
    }
};

export const resetMockScenario = async (request: APIRequestContext, url: string, scenario = "default") => {
    const response = await request.post(`${url}/__admin/reset`, {
        data: {
            scenario,
        },
    });
    if (!response.ok()) {
        throw new Error(`Could not reset ${url} to scenario ${scenario}`);
    }
};

export const goHome = async (page: Page) => {
    await page.goto("/", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
    });
};

export const openAppMenu = async (page: Page) => {
    const openMenuButton = page.getByRole("button", { name: "Open menu" });
    if (await openMenuButton.count()) {
        await openMenuButton.click();
        return;
    }

    const openNavigationButton = page.getByRole("button", { name: "Open navigation" });
    if (await openNavigationButton.count()) {
        await openNavigationButton.click();
    }
};

export const clickHeaderLink = async (page: Page, label: string) => {
    const headerLink = page.locator(".AppHeader__menuLink, .AppHeader__drawerMenuLink").filter({ hasText: label }).first();

    if ((await headerLink.count()) > 0) {
        await headerLink.click();
        return;
    }

    const burger = page.getByRole("button", { name: "Open navigation" });
    if ((await burger.count()) > 0) {
        await burger.click();
        await page.locator(".AppHeader__drawerMenuLink").filter({ hasText: label }).first().click();
    }
};

export const clickVisibleLink = async (page: Page, label: string) => {
    const link = page.getByRole("link", { name: label });
    await link.click({ force: true });
};

export const scrollToBottom = async (page: Page) => {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
};

export const openSyndicationPage = async (page: Page) => {
    const syndicationLink = page.locator(".AppHeader__drawerNav").getByRole("link", { name: "Syndication" });
    if ((await syndicationLink.count()) > 0) {
        await syndicationLink.click();
        return;
    }

    await page.getByRole("link", { name: "Manage endpoints" }).click();
};
