import { runDisclaimerFlow } from "./disclaimers/shared";

describe("disclaimers desktop", () => {
    it("shows the disclaimer drawer entry and walks every disclaimer page", () => {
        runDisclaimerFlow("desktop");
        runDisclaimerFlow("mobile");
    });
});
