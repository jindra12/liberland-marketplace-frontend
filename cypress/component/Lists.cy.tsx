import { LIST_GOALS, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    goToList,
    goToSyndicationList,
    homepageQueries,
    mountMainHome,
    waitForSearchQuery,
} from "../support/component-tests/utils";

describe("lists", () => {
    beforeEach(() => {
        mountMainHome();
    });

    it("Fetches homepage queries", () => {
        homepageQueries();
    });

    LIST_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} list from home`, () => {
            goToList(goal);
        });
    });

    it("filters a list by tribe using autocomplete search", () => {
        cy.contains(".AppHeader__menuLink", "Jobs").click();
        cy.contains("h2", "Jobs").should("be.visible");

        cy.get(".FilterControl .ant-select-selector").click();
        cy.get(".FilterControl .ant-select-selection-search-input").type("Nova Rivers", { force: true });
        waitForSearchQuery(MAIN_SERVER_URL, "SearchIdentities", "Nova Rivers", "Nova Rivers");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "Nova Rivers")
            .should("be.visible")
            .click({ force: true });
        cy.contains(".FilterControl .ant-select-selection-item", "Nova Rivers").should("be.visible");
    });

    it("opens the Syndication list from home", () => {
        goToSyndicationList();
    });
});
