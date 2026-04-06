import "cypress-react-router/add-commands";
import { drainGraphQLRequestLogs, installGraphQLMock } from "./graphqlMock";

import "../../src/index.scss";

beforeEach(() => {
    installGraphQLMock();
});

afterEach(function (this: Mocha.Context) {
    cy.screenshot();

    const logs = drainGraphQLRequestLogs();
    if (logs.length > 0) {
        cy.task("saveGraphQLRequestLogs", {
            specRelative: Cypress.spec.relative,
            logs,
        });
    }

    if (this.currentTest?.state === "failed" && Cypress.browser.isHeaded !== true) {
        Cypress.stop();
        return;
    }
});
