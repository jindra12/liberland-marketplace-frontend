import * as React from "react";

import { mount } from "cypress/react";

import Main from "../../src/Main";

describe("Main", () => {
    it("mounts and pauses", () => {
        mount(<Main />);
        cy.window().its("cyNavigate").should("be.a", "function");
        cy.routerNavigate("/");
        cy.pause();
    });
});
