import * as React from "react";

import { Button } from "antd";

import { disclaimerDefinitions } from "../../../src/components/disclaimers/constants";
import { DisclaimersModal } from "../../../src/components/disclaimers/DisclaimersModal";
import { DisclaimersProvider, useDisclaimers } from "../../../src/components/disclaimers/context";

import { mountWithProviders } from "../../support/component-tests/utils";

type DisclaimerViewport = "desktop" | "mobile";

const getDrawerButtonSelector = (viewport: DisclaimerViewport) =>
    viewport === "desktop" ? ".AppHeader__quickActionsBtn" : ".AppHeader__burger";

const getDrawerOpenLabel = (viewport: DisclaimerViewport) => (viewport === "desktop" ? "Menu" : "Disclaimers");

const DisclaimerHarness: React.FunctionComponent<{ viewport: DisclaimerViewport }> = (props) => {
    const { openDisclaimers } = useDisclaimers();

    return (
        <Button
            className={getDrawerButtonSelector(props.viewport).slice(1)}
            onClick={() => {
                openDisclaimers();
            }}
        >
            {getDrawerOpenLabel(props.viewport)}
        </Button>
    );
};

export const mountDisclaimerRoute = (viewport: DisclaimerViewport) => {
    if (viewport === "desktop") {
        cy.viewport(1280, 900);
    } else {
        cy.viewport(390, 844);
    }

    mountWithProviders(
        <DisclaimersProvider>
            <DisclaimerHarness viewport={viewport} />
            <DisclaimersModal />
        </DisclaimersProvider>,
    );
};

export const runDisclaimerFlow = (viewport: DisclaimerViewport) => {
    mountDisclaimerRoute(viewport);
    screenshotDisclaimerDrawer(viewport);
    walkDisclaimerPages(viewport);
};

export const screenshotDisclaimerDrawer = (viewport: DisclaimerViewport) => {
    cy.get(getDrawerButtonSelector(viewport)).should("be.visible").click();
    cy.get(".DisclaimersModal .ant-modal-content").should("be.visible");
    cy.screenshot(`${Cypress.spec.name} ${viewport} drawer`.replace(/[^a-zA-Z0-9]+/g, "-"), {
        capture: "viewport",
    });
};

export const walkDisclaimerPages = (viewport: DisclaimerViewport) => {
    cy.contains(".DisclaimersModal__title", disclaimerDefinitions[0].title).should("be.visible");

    disclaimerDefinitions.forEach((definition, index) => {
        if (index > 0) {
            cy.contains(".DisclaimersModal__menu .ant-menu-item", definition.title).click({
                force: true,
            });
        }

        cy.contains(".DisclaimersModal__title", definition.title).should("be.visible");
        cy.contains(".DisclaimersModal__title", definition.title).scrollIntoView();
        const screenshotName = `${Cypress.spec.name} ${viewport} ${definition.key}`.replace(/[^a-zA-Z0-9]+/g, "-");

        cy.screenshot(screenshotName, {
            capture: "viewport",
        });
    });
};
