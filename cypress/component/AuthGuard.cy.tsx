import * as React from "react";

import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextProps } from "react-oidc-context";

import { AuthGuard } from "../../src/components/AuthGuard";

const buildAuthStub = (signinRedirect: sinon.SinonStub) => {
    return {
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: undefined,
        signinRedirect,
    } as any as AuthContextProps;
};

const mountAuthGuard = (pathname: string, signinRedirect: sinon.SinonStub) => {
    mount(
        <AuthContext.Provider value={buildAuthStub(signinRedirect)}>
            <MemoryRouter initialEntries={[pathname]}>
                <AuthGuard redirect>
                    <div className="AuthGuard__content">Protected</div>
                </AuthGuard>
            </MemoryRouter>
        </AuthContext.Provider>,
    );
};

describe("auth guard", () => {
    it("keeps the current route in signin state when redirecting unauthenticated users", () => {
        const signinRedirect = cy.stub().resolves();

        mountAuthGuard("/publish", signinRedirect);

        cy.get(".AuthGuard__content").should("not.exist");
        cy.get(".ant-spin").should("be.visible");
        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.wrap(signinRedirect).its("firstCall.args.0.state").should("eq", "/publish");
    });
});
