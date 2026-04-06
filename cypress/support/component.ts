import "cypress-react-router/add-commands";
import { drainGraphQLRequestLogs, installGraphQLMock, resetGraphQLMock } from "./graphqlMock";

import "../../src/index.scss";

type CypressWithStop = Cypress.Cypress & {
    stop?: () => void;
};

Cypress.Commands.add("resetQL", () => {
    resetGraphQLMock();
});

beforeEach(() => {
    installGraphQLMock();
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
