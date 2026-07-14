import { mountMainRoute, screenshotStep } from "../support/component-tests/utils";
import { clearLocalStorageAndGoHome } from "../support/component-tests/storageReset";

describe("not found", () => {
    it("shows the 404 page and returns home", () => {
        mountMainRoute("/definitely-not-a-real-route");

        cy.contains("Page not found").should("be.visible");
        cy.contains("The page you requested does not exist.").should("be.visible");
        screenshotStep("not-found-page-visible");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
        screenshotStep("not-found-returned-home");
    });

    it("clears local storage and goes home from the 404 page", () => {
        mountMainRoute("/definitely-not-a-real-route");

        const clearStorage = cy.stub();
        const replaceHome = cy.stub();

        cy.contains("Erase local storage and go home").should("be.visible");
        cy.contains("This clears your saved syndication settings and cart data.").should("be.visible");
        screenshotStep("not-found-reset-storage-visible");

        clearLocalStorageAndGoHome({
            localStorage: {
                clear: clearStorage,
            },
            location: {
                replace: replaceHome,
            },
        });

        expect(clearStorage).to.have.callCount(1);
        expect(replaceHome).to.have.been.calledWith("/");
    });
});
