import { DETAIL_HOME_GOALS } from "../support/component-tests/constants";
import { goToDetailFromHome, mountMainHome } from "../support/component-tests/utils";

describe("details", () => {
    beforeEach(() => {
        mountMainHome();
    });

    DETAIL_HOME_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail from home`, () => {
            goToDetailFromHome(goal);
        });
    });
});
