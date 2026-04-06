import "cypress-react-router/add-commands";
import { installGraphQLMock } from "./graphqlMock";

import "../../src/index.scss";

before(() => {
    installGraphQLMock();
});

afterEach(function (this: Mocha.Context) {
    cy.screenshot();

    if (this.currentTest?.state === "failed" && Cypress.browser.isHeaded !== true) {
        Cypress.stop();
        return;
    }
});
