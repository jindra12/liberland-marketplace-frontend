import { disclaimerDefinitions } from "../../../src/components/disclaimers/constants";

import { MAIN_SERVER_URL } from "../../support/component-tests/constants";
import { mountAnonymousRoute } from "../../support/component-tests/utils";

type DisclaimerViewport = "desktop" | "mobile";

const getDrawerSelector = (viewport: DisclaimerViewport) =>
    viewport === "desktop" ? ".AppHeader__desktopDrawer" : ".AppHeader__drawer";

const getDrawerButtonSelector = (viewport: DisclaimerViewport) =>
    viewport === "desktop" ? ".AppHeader__quickActionsBtn" : ".AppHeader__burger";

const getDrawerOpenLabel = (viewport: DisclaimerViewport) => (viewport === "desktop" ? "Menu" : "Disclaimers");

export const mountDisclaimerRoute = (viewport: DisclaimerViewport) => {
    if (viewport === "desktop") {
        cy.viewport(1280, 900);
    } else {
        cy.viewport(390, 844);
    }

    mountAnonymousRoute("/", [MAIN_SERVER_URL]);
};

export const runDisclaimerFlow = (viewport: DisclaimerViewport) => {
    mountDisclaimerRoute(viewport);
    screenshotDisclaimerDrawer(viewport);
    walkDisclaimerPages(viewport);
};

export const screenshotDisclaimerDrawer = (viewport: DisclaimerViewport) => {
    cy.get(getDrawerButtonSelector(viewport)).should("be.visible").click();
    cy.contains(getDrawerSelector(viewport), getDrawerOpenLabel(viewport)).should("be.visible");
    cy.contains(getDrawerSelector(viewport), "Disclaimers").should("be.visible");
    cy.get(getDrawerSelector(viewport))
        .screenshot(`${Cypress.spec.name} ${viewport} drawer`.replace(/[^a-zA-Z0-9]+/g, "-"));
};

export const walkDisclaimerPages = (viewport: DisclaimerViewport) => {
    cy.contains(`${getDrawerSelector(viewport)} button`, "Disclaimers").click();
    cy.contains(".DisclaimersModal__title", disclaimerDefinitions[0].title).should("be.visible");

    disclaimerDefinitions.forEach((definition, index) => {
        if (index > 0) {
            cy.contains(".DisclaimersModal__menu .ant-menu-item", definition.title).click({
                force: true,
            });
        }

        cy.contains(".DisclaimersModal__title", definition.title).should("be.visible");
        const screenshotName = `${Cypress.spec.name} ${viewport} ${definition.key}`.replace(/[^a-zA-Z0-9]+/g, "-");

        if (viewport === "mobile") {
            cy.contains(".DisclaimersModal__title", definition.title).scrollIntoView();
            cy.screenshot(screenshotName, {
                capture: "viewport",
            });
        } else {
            cy.get(".DisclaimersModal .ant-modal-content").first().screenshot(screenshotName);
        }
    });
};
