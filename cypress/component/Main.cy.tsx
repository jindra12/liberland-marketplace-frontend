import {
    DETAIL_HOME_GOALS,
    LIST_GOALS,
    SEARCH_GOALS,
} from "../support/component-tests/constants";
import {
    goToDetailFromHome,
    goToDetailFromSearch,
    goToList,
    goToSyndicationList,
    homepageQueries,
    mountMainHome,
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

    it("opens the Syndication list from home", () => {
        goToSyndicationList();
    });
});

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
