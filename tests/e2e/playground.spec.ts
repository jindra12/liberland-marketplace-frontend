import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { setMarketplaceEndpoints } from "./helpers/marketplace";
import { test } from "./fixtures/test";

test("playground", async ({ page }) => {
    const [alphaServer, betaServer] = SYNDICATION_SERVERS;
    await setMarketplaceEndpoints(page, [
        {
            enabled: true,
            name: betaServer.name,
            value: betaServer.url,
        },
        {
            enabled: true,
            name: alphaServer.name,
            value: alphaServer.url,
        },
    ]);
    await page.goto("/");
    await page.pause();
});
