import { AUTHORIZED_TOUR_SCENARIOS, runTourSuite } from "./tours/shared";

describe("tours authorized mobile", () => {
    runTourSuite(AUTHORIZED_TOUR_SCENARIOS, "authorized", "mobile");
});
