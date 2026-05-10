import { mountDisclaimerRoute, screenshotDisclaimerDrawer, walkDisclaimerPages } from "./disclaimers/shared";

describe("disclaimers desktop", () => {
    it("shows the disclaimer drawer entry and walks every disclaimer page", () => {
        mountDisclaimerRoute("desktop");
        screenshotDisclaimerDrawer("desktop");
        walkDisclaimerPages("desktop");
    });
});
