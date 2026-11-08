import React from "react";
import { mount } from "cypress/react";
import { User, UserManager } from "oidc-client-ts";
import { MemoryRouter } from "react-router-dom";
import { AuthContextProviderInner } from "../../src/components/auth/AuthContextProviderInner";
import { buildAuthSettings } from "../../src/components/auth/utils";
import { AuthAuthorityProbe } from "../support/security-regressions/AuthAuthorityProbe";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AUTH_URL_STORAGE_KEY } from "../../src/components/endpoints/constants";

describe("Endpoint session safety", { retries: 0 }, () => {
    const peers = new Set<Window>();
    afterEach(() => {
        peers.forEach((peer) => peer.close());
        peers.clear();
    });

    it("observes account replacement and logout from another browser window without losing the draft", () => {
        const settings = { ...buildAuthSettings(MAIN_SERVER_URL), automaticSilentRenew: false };
        const storedKey = `oidc.user:${settings.authority}:${settings.client_id}`;
        const alice = new User({
            access_token: "fixture-alice",
            token_type: "Bearer",
            expires_at: Math.floor(Date.now() / 1000) + 3600,
            profile: { iss: settings.authority, aud: settings.client_id, sub: "alice", iat: 1, exp: 9999999999 },
        });
        const bob = new User({ ...alice, access_token: "fixture-bob", profile: { ...alice.profile, sub: "bob" } });
        cy.stub(UserManager.prototype, "getUser").resolves(alice);
        const client = new QueryClient();
        client.setQueryData(["PrivateAccount", MAIN_SERVER_URL], "Alice private data");
        client.setQueryData(["PrivateAccount", COOP_SERVER_URL], "Independent backend data");
        mount(
            <QueryClientProvider client={client}>
                <MemoryRouter>
                    <AuthContextProviderInner authSettings={settings} setLoginSuccessPending={cy.stub()}>
                        <AuthAuthorityProbe />
                    </AuthContextProviderInner>
                </MemoryRouter>
            </QueryClientProvider>,
        );
        cy.get('[data-cy="auth-subject"]').should("have.text", "alice");
        cy.contains("button", "Keep main server in this tab").click();
        cy.get('input[aria-label="Unsaved draft"]').type("Keep my draft across account changes");
        cy.window().then((win) => {
            const peer = win.open("about:blank", "auth-storage-peer");
            expect(peer, "A real same-origin peer window").not.to.equal(null);
            peers.add(peer!);
            peer!.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(COOP_SERVER_URL));
            peer!.localStorage.setItem(storedKey, bob.toStorageString());
        });
        cy.get('[data-cy="auth-subject"]').should("have.text", "bob");
        cy.get('[data-cy="selected-server"]').should("have.text", MAIN_SERVER_URL);
        cy.then(() => {
            expect(client.getQueryData(["PrivateAccount", MAIN_SERVER_URL])).to.equal(undefined);
            expect(client.getQueryData(["PrivateAccount", COOP_SERVER_URL])).to.equal("Independent backend data");
        });
        cy.get('input[aria-label="Unsaved draft"]').should("have.value", "Keep my draft across account changes");
        cy.then(() => peers.forEach((peer) => peer.localStorage.removeItem(storedKey)));
        cy.get('[data-cy="auth-subject"]').should("have.text", "Signed out");
        cy.get('input[aria-label="Unsaved draft"]').should("have.value", "Keep my draft across account changes");
        cy.get('[data-cy="auth-authority"]').should("have.text", settings.authority);
    });
    it("keeps an unsaved input mounted when switching authentication authorities", () => {
        cy.stub(UserManager.prototype, "getUser").resolves(null);
        const signIn = cy.stub(UserManager.prototype, "signinRedirect").resolves();
        const reportSuccess = cy.stub();
        const client = new QueryClient();
        mount(
            <QueryClientProvider client={client}>
                <MemoryRouter>
                    <AuthContextProviderInner
                        authSettings={{ ...buildAuthSettings(MAIN_SERVER_URL), automaticSilentRenew: false }}
                        setLoginSuccessPending={reportSuccess}
                    >
                        <AuthAuthorityProbe />
                    </AuthContextProviderInner>
                </MemoryRouter>
            </QueryClientProvider>,
        ).then((component) => {
            cy.get('input[aria-label="Unsaved draft"]').type("Unsaved profile changes");
            cy.then(() =>
                component.rerender(
                    <QueryClientProvider client={client}>
                        <MemoryRouter>
                            <AuthContextProviderInner
                                authSettings={{ ...buildAuthSettings(COOP_SERVER_URL), automaticSilentRenew: false }}
                                setLoginSuccessPending={reportSuccess}
                            >
                                <AuthAuthorityProbe />
                            </AuthContextProviderInner>
                        </MemoryRouter>
                    </QueryClientProvider>,
                ),
            );
            cy.get('input[aria-label="Unsaved draft"]').should("have.value", "Unsaved profile changes");
            cy.get('[data-cy="auth-authority"]').should("have.text", `${COOP_SERVER_URL}/api/auth`);
            cy.contains("button", "Sign in to current server").click();
            cy.then(() => {
                expect(signIn.callCount).to.equal(1);
                expect(signIn.firstCall.thisValue.settings.authority).to.equal(`${COOP_SERVER_URL}/api/auth`);
            });
        });
    });
});
