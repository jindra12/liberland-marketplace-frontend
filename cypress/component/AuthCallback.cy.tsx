import * as React from "react";

import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextProps } from "react-oidc-context";

import AuthCallback from "../../src/components/AuthCallback";

import { screenshotStep } from "../support/component-tests/utils";

type AuthError = Error & {
    error?: string;
    error_description?: string;
};

const buildAuthError = (): AuthError => {
    const error = new Error("invalid_client: client_id is required") as AuthError;

    error.error = "invalid_client";
    error.error_description = "client_id is required";

    return error;
};

const getAuthStub = (): AuthContextProps => {
    return {
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: buildAuthError(),
    } as AuthContextProps;
};

const mountAuthCallback = () => {
    mount(
        <AuthContext.Provider value={getAuthStub()}>
            <MemoryRouter initialEntries={["/auth/callback"]}>
                <AuthCallback />
            </MemoryRouter>
        </AuthContext.Provider>,
    );
};

const runAuthCallbackFlow = (viewportWidth: number, viewportHeight: number, screenshotName: string) => {
    cy.viewport(viewportWidth, viewportHeight);
    mountAuthCallback();

    cy.contains("Could not complete sign-in").should("be.visible");
    cy.contains("Back to homepage").should("be.visible");
    cy.get(".AuthCallback__errorPanel").should("be.visible");
    cy.get(".AuthCallback__error").should("have.css", "text-align", "left");
    cy.get(".AuthCallback .ant-result-title").should("have.css", "color", "rgb(248, 250, 252)");
    cy.contains("invalid_client: client_id is required").should("be.visible");
    cy.contains("client_id is required").should("be.visible");
    cy.window().then((win) => {
        expect(win.document.documentElement.scrollWidth).to.equal(win.document.documentElement.clientWidth);
    });
    cy.get(".AuthCallback__errorPanel").then(($panel) => {
        const rect = $panel[0].getBoundingClientRect();
        const viewportCenter = viewportWidth / 2;
        const panelCenter = rect.left + rect.width / 2;

        expect(Math.abs(panelCenter - viewportCenter)).to.be.lessThan(6);
    });
    screenshotStep(screenshotName, "viewport");
};

describe("auth callback", () => {
    it("renders the auth error page on desktop", () => {
        runAuthCallbackFlow(1440, 1200, "auth-callback-desktop-error");
    });

    it("renders the auth error page on mobile", () => {
        runAuthCallbackFlow(390, 844, "auth-callback-mobile-error");
    });
});
