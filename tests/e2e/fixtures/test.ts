import { expect, test as base } from "@playwright/test";

import { installWalletMocks } from "./walletMocks";

export const test = base.extend({
    context: async ({ context }, use) => {
        await installWalletMocks(context);
        await use(context);
    },
});

export { expect };
