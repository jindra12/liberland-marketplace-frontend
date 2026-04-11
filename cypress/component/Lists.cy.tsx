import { LIST_GOALS } from "../support/component-tests/constants";
import { goToList, goToSyndicationList, homepageQueries, mountMainHome } from "../support/component-tests/utils";

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

    it("opens the Syndication list from home", () => {
        goToSyndicationList();
    });
});
