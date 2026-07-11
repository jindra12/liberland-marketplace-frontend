import { runAuthPromptScreenshot, runTourSuite, UNAUTHORIZED_TOUR_SCENARIOS } from "./tours/shared";

describe("tours unauthorized desktop", () => {
    runTourSuite(UNAUTHORIZED_TOUR_SCENARIOS, "unauthorized");

    it("shows the auth prompt for protected tours", () => {
        runAuthPromptScreenshot("desktop");
    });

    it("shows the auth prompt for protected tours on mobile", () => {
        runAuthPromptScreenshot("mobile");
    });
});
