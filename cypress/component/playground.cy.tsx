import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";
import { DEFAULT_MARKETPLACE_ENDPOINTS } from "../support/constants";
import { goHome, setInitialPath, setMarketplaceEndpoints, waitForSplashContent } from "../support/marketplace";
import "../../src/index.scss";

describe("playground", () => {
    it("pauses on the app shell", () => {
        cy.viewport(1920, 1080);
        setMarketplaceEndpoints(DEFAULT_MARKETPLACE_ENDPOINTS);
        setInitialPath("/");
        mount(<Main />);
        goHome();
        waitForSplashContent();
        cy.pause();
    });
});
