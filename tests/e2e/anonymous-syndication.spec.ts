import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { expect, test } from "./fixtures/test";
import { goHome, openAppMenu, resetMockScenario, setMarketplaceEndpoints } from "./helpers/marketplace";

const alphaUrl = SYNDICATION_SERVERS[0].url;
const betaUrl = SYNDICATION_SERVERS[1].url;

test.describe.configure({ mode: "serial" });

test("anonymous users do not see syndication when there is only one server", async ({ page, request }) => {
    await resetMockScenario(request, alphaUrl);
    await setMarketplaceEndpoints(page, [
        {
            enabled: true,
            name: "Main",
            value: alphaUrl,
        },
    ]);
    await goHome(page);

    await openAppMenu(page);
    await expect(page.getByRole("link", { name: "Syndication" })).toHaveCount(0);
});

test("anonymous users can open the syndication menu and toggle a syndicated server", async ({ page, request }) => {
    await resetMockScenario(request, alphaUrl);
    await resetMockScenario(request, betaUrl);
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

    await openAppMenu(page);
    await page.getByRole("link", { name: "Syndication" }).click();
    await expect(page.getByRole("heading", { name: "Syndication" })).toBeVisible();
    await page.getByRole("link", { name: "Alpha Mock Market" }).click();

    await expect(page.locator(".SyndicationDetail")).toBeVisible();
    await expect(page.getByRole("button", { name: "Disable URL" })).toBeVisible();
    await page.getByRole("button", { name: "Disable URL" }).click();
    await expect(page.getByRole("button", { name: "Enable URL" })).toBeVisible();
    await expect(page.getByText("Disabled locally")).toBeVisible();
    await page.getByRole("button", { name: "Enable URL" }).click();
    await expect(page.getByRole("button", { name: "Disable URL" })).toBeVisible();
    await expect(page.getByText("Enabled in search and lists")).toBeVisible();
});
