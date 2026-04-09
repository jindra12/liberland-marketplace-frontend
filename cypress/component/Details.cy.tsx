import { DETAIL_HOME_GOALS } from "../support/component-tests/constants";
import { goToDetailFromHome, mountMainHome } from "../support/component-tests/utils";

describe("details", () => {
    beforeEach(() => {
        cy.on("uncaught:exception", (error) => {
            if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
                return false;
            }

            return undefined;
        });
        mountMainHome();
    });

    DETAIL_HOME_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail from home`, () => {
            goToDetailFromHome(goal);
        });
    });
});
