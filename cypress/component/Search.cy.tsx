import { SEARCH_GOALS } from "../support/component-tests/constants";
import { goToDetailFromSearch, mountMainHome } from "../support/component-tests/utils";

describe("search", () => {
    beforeEach(() => {
        mountMainHome();
    });

    SEARCH_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail through ${goal.scopeLabel} search`, () => {
            goToDetailFromSearch(goal);
        });
    });
});
