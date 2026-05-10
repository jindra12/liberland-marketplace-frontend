import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";

import { RuntimeErrorState } from "../../src/components/ErrorBoundary/RuntimeErrorState";

describe("runtime error state", () => {
    it("shows the storage reset prompt on the error page", () => {
        mount(
            <MemoryRouter initialEntries={["/broken?section=details#summary"]}>
                <RuntimeErrorState error={new Error("Something broke")} onRetry={() => undefined} scope="route" />
            </MemoryRouter>,
        );

        cy.contains("This clears your saved syndication settings and cart data.").should("be.visible");
        cy.contains("Erase local storage and go home").should("be.visible");
    });
});
