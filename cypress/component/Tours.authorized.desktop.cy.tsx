import { AUTHORIZED_TOUR_SCENARIOS, runTourSuite } from "./tours/shared";

describe("tours authorized desktop", () => {
    runTourSuite(AUTHORIZED_TOUR_SCENARIOS, "authorized", "desktop");
});
