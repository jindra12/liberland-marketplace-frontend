import * as React from "react";

import { JobSearch } from "../../src/components/search/JobSearch";
import { mountWithProviders } from "../support/component-tests/mount";
import { screenshotStep, waitForSearchQuery, waitForSearchResultsPage } from "../support/component-tests/utils";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";

describe("search", () => {
    beforeEach(() => {
        cy.resetQL();
    });

    it("renders the job search component directly and paginates results", () => {
        cy.viewport(1440, 1200);
        mountWithProviders(<JobSearch onClose={() => undefined} />);

        cy.get(".SearchDrawer").should("be.visible");
        cy.get(".SearchDrawer__footerForm input").should("be.visible").type("a{enter}");

        waitForSearchQuery(MAIN_SERVER_URL, "SearchJobs", "a", "Dockmaster", 1);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("eq", 5);

        cy.get("#SearchDrawer__scrollable").scrollTo("bottom");
        waitForSearchResultsPage(MAIN_SERVER_URL, "SearchJobs", "a", 2);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("be.greaterThan", 5);

        screenshotStep("search-job-search-direct-component");
    });
});
