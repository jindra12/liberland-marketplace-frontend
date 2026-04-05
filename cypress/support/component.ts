import "cypress-react-router/add-commands";

import "../../src/index.scss";
import { installWalletMocks } from "./walletMocks";

Cypress.on("window:before:load", (win) => {
    installWalletMocks(win);
});
