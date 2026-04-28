import { runAuthPromptScreenshot, runTourSuite, UNAUTHORIZED_TOUR_SCENARIOS } from "./tours/shared";

describe("tours unauthorized mobile", () => {
    runTourSuite(UNAUTHORIZED_TOUR_SCENARIOS, "unauthorized", "mobile");

    it("shows the auth prompt for protected tours", () => {
        runAuthPromptScreenshot("mobile");
    });
});
