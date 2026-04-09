import { SEARCH_GOALS } from "../support/component-tests/constants";
import { goToDetailFromSearch, mountMainHome } from "../support/component-tests/utils";

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
});
