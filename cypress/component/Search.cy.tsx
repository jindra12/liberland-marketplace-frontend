import { SEARCH_GOALS } from "../support/component-tests/constants";
import {
    goToDetailFromSearch,
    mountMainHome,
    openSearchScope,
    waitForSearchQuery,
    waitForSearchResultsPage,
} from "../support/component-tests/utils";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";

describe("search", () => {
    beforeEach(() => {
        cy.on("uncaught:exception", (error) => {
            if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
                return false;
            }

            return undefined;
        });
        mountMainHome();
    });

    SEARCH_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail through ${goal.scopeLabel} search`, () => {
            goToDetailFromSearch(goal);
        });
    });

    it("loads another page of job search results when scrolled", () => {
        openSearchScope("Jobs");
        cy.contains(".ant-drawer-title", "Job search")
            .should("be.visible")
            .closest(".ant-drawer")
            .within(() => {
                cy.get(".SearchDrawer__footerForm input").should("be.visible").clear().type(" {enter}");
            });

        waitForSearchQuery(MAIN_SERVER_URL, "SearchJobs", " ", "Dockmaster", 1);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("eq", 5);
        cy.get(".SearchDrawer .AnimatedIn").first().should("have.css", "opacity", "1");

        cy.get(`#SearchDrawer__scrollable`).scrollTo("bottom");
        waitForSearchResultsPage(MAIN_SERVER_URL, "SearchJobs", " ", 2);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("be.greaterThan", 5);
    });
});
