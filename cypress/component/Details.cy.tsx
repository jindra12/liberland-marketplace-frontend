import { DETAIL_HOME_GOALS } from "../support/component-tests/constants";
import { goToDetailFromHome, mountMainRoute, screenshotStep } from "../support/component-tests/utils";

describe("details", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        cy.on("uncaught:exception", (error) => {
            if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
                return false;
            }

            return undefined;
        });
    });

    DETAIL_HOME_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail from home`, () => {
            goToDetailFromHome(goal);
        });
    });

    it("opens the Dockmaster detail from home on mobile", () => {
        cy.viewport(390, 844);
        const detailGoal = DETAIL_HOME_GOALS.find((goal) => goal.title === "Dockmaster");
        if (detailGoal === undefined) {
            throw new Error("Missing Dockmaster detail goal");
        }

        mountMainRoute(detailGoal.route);
        cy.location("pathname").should("eq", detailGoal.route);
        cy.contains(detailGoal.detailTitleSelector, detailGoal.title, { timeout: 20000 }).should("be.visible");
        cy.get(".AnimatedIn", { timeout: 20000 }).first().should("have.css", "opacity", "1");
        screenshotStep(`detail-mobile-${detailGoal.title}`);
    });
});
