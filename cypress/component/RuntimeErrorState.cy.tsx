import { RuntimeErrorState } from "../../src/components/ErrorBoundary/RuntimeErrorState";
import { mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";

describe("runtime error recovery", () => {
    [390, 1440].forEach((width) => {
        it(`offers safe recovery before technical details at ${width}px`, () => {
            cy.viewport(width, 900);
            mountWithProviders(
                <RuntimeErrorState
                    error={new Error("Chunk details for diagnosis")}
                    onRetry={cy.stub().as("retry")}
                    scope="route"
                />,
                {
                    route: "/broken?section=details",
                    setup: (win) => win.localStorage.setItem("saved-cart", "keep-me"),
                },
            );

            cy.contains("We couldn't load this page").should("be.visible");
            cy.contains("button", "Try again").click();
            cy.get("@retry").should("have.been.calledOnce");
            cy.contains("Back to marketplace").should("have.attr", "href", "/");
            cy.get(".RuntimeErrorState__technicalMessage").should("not.exist");
            cy.contains("button", "Reset browser settings").should("not.exist");
            screenshotStep(`safe-recovery-${width}`, "viewport");

            cy.contains("Technical details").click();
            cy.get(".RuntimeErrorState__technicalMessage")
                .should("be.visible")
                .and("contain.text", "Chunk details for diagnosis");
            cy.contains("Advanced recovery").click();
            cy.contains("button", "Reset browser settings").click();
            cy.contains("Reset saved browser settings?").should("be.visible");
            cy.contains("button", "Keep my settings").click();
            cy.window().then((win) => {
                expect(win.localStorage.getItem("saved-cart")).to.equal("keep-me");
            });
        });
    });
});
