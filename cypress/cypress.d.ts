/// <reference types="cypress" />
/// <reference types="cypress-react-router" />
declare module "*.scss";
declare module "*.css";

declare namespace Cypress {
    interface Chainable {
        resetQL(): Chainable<void>;
    }
}
