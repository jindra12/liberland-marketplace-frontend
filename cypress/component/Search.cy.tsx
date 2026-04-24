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
                cy.get(".SearchDrawer__footerForm input").should("be.visible").clear().type("a{enter}");
            });

        waitForSearchQuery(MAIN_SERVER_URL, "SearchJobs", "a", "Dockmaster", 1);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("eq", 5);

        cy.get(`#SearchDrawer__scrollable`).scrollTo("bottom");
        waitForSearchResultsPage(MAIN_SERVER_URL, "SearchJobs", "a", 2);
        cy.get(".SearchDrawer .ant-list-item").its("length").should("be.greaterThan", 5);
    });

    it("renders the search footer as a compact full-width control", () => {
        openSearchScope("Jobs");
        cy.contains(".ant-drawer-title", "Job search")
            .should("be.visible")
            .closest(".ant-drawer")
            .within(() => {
                cy.get(".SearchDrawer__footerForm").then(($form) => {
                    cy.get(".SearchDrawer__footerCompact").then(($compact) => {
                        const formWidth = $form[0].getBoundingClientRect().width;
                        const compactWidth = $compact[0].getBoundingClientRect().width;
                        expect(Math.abs(compactWidth - formWidth)).to.be.lessThan(2);
                    });
                });

                cy.get(".SearchDrawer__footerCompact .SearchDrawer__footerInput").should(
                    "have.css",
                    "height",
                    "100px",
                );
                cy.get(".SearchDrawer__footerCompact .SearchDrawer__footerButton").should("have.css", "height", "100px");
            });
    });

    it("rejects whitespace-only job search input", () => {
        openSearchScope("Jobs");
        cy.contains(".ant-drawer-title", "Job search")
            .should("be.visible")
            .closest(".ant-drawer")
            .within(() => {
                cy.get(".SearchDrawer__footerForm input").should("be.visible").type("  ", {
                    parseSpecialCharSequences: false,
                });
                cy.get(".SearchDrawer__footerForm").submit();
                cy.contains(".ant-form-item-explain-error", "Search is required").should("be.visible");
            });
    });
});
