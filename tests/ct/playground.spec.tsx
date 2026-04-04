import * as React from "react";

import Main from "../../src/Main";
import { SYNDICATION_SERVERS } from "./fixtures/constants";
import { setMarketplaceEndpoints } from "./helpers/marketplace";
import { test } from "./fixtures/test";

test("playground", async ({ page, mount }) => {
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
    await page.evaluate(() => {
        window.history.replaceState({}, "", "/");
    });
    await mount(<Main />);
    await page.pause();
});
