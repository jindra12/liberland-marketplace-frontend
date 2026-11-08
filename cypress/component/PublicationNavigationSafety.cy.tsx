import React from "react";
import { PublishForms } from "../../src/components/publish/PublishForms";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { createMemoryRouter, Link, RouterProvider } from "react-router-dom";
import { CompanyForm } from "../../src/components/publish/CompanyForm";
import { Typography } from "antd";

describe("Publication navigation and keyboard safety", { retries: 0 }, () => {
    it("preserves an edited form when a user cancels route navigation and leaves only after confirmation", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, { body: { data: { Identities: { docs: [] } } } });
        const router = createMemoryRouter(
            [
                {
                    path: "/edit",
                    element: (
                        <>
                            <Link to="/next">Leave editor</Link>
                            <CompanyForm mode="create" url={MAIN_SERVER_URL} />
                        </>
                    ),
                },
                { path: "/next", element: <Typography.Text>Navigation completed</Typography.Text> },
            ],
            { initialEntries: ["/edit"] },
        );
        // The router is part of this regression: no application route tree is mounted.
        mountPublicFederatedList(<RouterProvider router={router} />, undefined, { withoutRouter: true });
        cy.get("#name").type("Keep this company draft");
        cy.contains("a", "Leave editor").click();
        cy.contains("button", "Keep editing").click();
        cy.get("#name").should("have.value", "Keep this company draft");
        cy.window().then((win) => {
            const event = new Event("beforeunload", { cancelable: true });
            win.dispatchEvent(event);
            expect(event.defaultPrevented, "Dirty forms must also warn before closing or refreshing the tab").to.equal(
                true,
            );
        });
        cy.contains("a", "Leave editor").click();
        cy.contains("button", "Discard changes").click();
        cy.contains("Navigation completed").should("exist");
    });
    it("does not destroy an unsaved company form when returning to category selection", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, { body: { data: { Identities: { docs: [] } } } });
        mountPublicFederatedList(<PublishForms url={MAIN_SERVER_URL} />);
        cy.contains(".Publish__category", "Company").click();
        cy.get("#name").type("Unsaved company draft");
        cy.contains("button", "Back").click();
        cy.get("#name").should("have.value", "Unsaved company draft");
        cy.contains("button", "Keep editing").click();
        cy.get("#name").should("have.value", "Unsaved company draft");
        cy.contains("button", "Back").click();
        cy.contains("button", "Discard draft").click();
        cy.contains("Choose what you'd like to publish").should("exist");
    });
});
