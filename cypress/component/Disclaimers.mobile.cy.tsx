import { mountDisclaimerRoute, screenshotDisclaimerDrawer, walkDisclaimerPages } from "./disclaimers/shared";

describe("disclaimers mobile", () => {
    it("shows the disclaimer drawer entry and walks every disclaimer page", () => {
        mountDisclaimerRoute("mobile");
        screenshotDisclaimerDrawer("mobile");
        walkDisclaimerPages("mobile");
    });
});
