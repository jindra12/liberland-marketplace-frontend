import { LIST_GOALS, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    goToList,
    goToSyndicationList,
    homepageQueries,
    mountMainHome,
    mountMainRoute,
    screenshotStep,
    waitForPageShell,
    waitForSearchQuery,
} from "../support/component-tests/utils";

describe("lists", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
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

    it("opens the Jobs list from home on mobile", () => {
        cy.viewport(390, 844);
        const jobsGoal = LIST_GOALS.find((goal) => goal.trigger === "Jobs");
        if (jobsGoal === undefined) {
            throw new Error("Missing Jobs list goal");
        }

        mountMainRoute(jobsGoal.route);
        waitForPageShell();
        cy.contains("h2", jobsGoal.title, { timeout: 20000 }).should("be.visible");
        cy.get(".JobList__body").should("be.visible").contains("Coordinate shipping and fulfilment");
        cy.get(".LikeButton").should("exist");
        screenshotStep("list-Jobs-mobile");
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
