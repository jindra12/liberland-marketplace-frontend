import "cypress-react-router/add-commands";
import { drainGraphQLRequestLogs, installGraphQLMock, resetGraphQLMock } from "./graphqlMock";
import { installMediaUploadMock, resetMediaUploadMock } from "./graphqlMock/mediaMock";

import "../../src/index.scss";

type CypressWithStop = Cypress.Cypress & {
    stop?: () => void;
};

Cypress.Commands.add("resetQL", () => {
    resetGraphQLMock();
});

Cypress.Commands.add("openPublishServerIfNeeded", (serverName = "Main") => {
    cy.get("body").then(($body) => {
        const chooser = $body.find(".PublishServer");
        if (chooser.length === 0) {
            return;
        }

        const button = $body[0].querySelector(".PublishServer__summary button") as HTMLButtonElement | null;
        if (!button) {
            return;
        }

        if (serverName) {
            const card = Array.from(chooser[0].querySelectorAll(".PublishServer__card")).find((entry) =>
                entry.textContent?.includes(serverName),
            ) as HTMLElement | undefined;
            if (card) {
                const chooserButton = card.querySelector("button") as HTMLButtonElement | null;
                chooserButton?.click();
            }
        }

        button.click();
    });
});

beforeEach(() => {
    installGraphQLMock();
    installMediaUploadMock();
    resetMediaUploadMock();
});

afterEach(function (this: Mocha.Context) {
    cy.resetQL();
    cy.screenshot();

    const logs = drainGraphQLRequestLogs();
    if (logs.length > 0) {
        cy.task("saveGraphQLRequestLogs", {
            specRelative: Cypress.spec.relative,
            logs,
        });
    }

    if (this.currentTest?.state === "failed" && Cypress.browser.isHeaded !== true) {
        const cypress = Cypress as CypressWithStop;
        cypress.stop?.();
        return;
    }
});
