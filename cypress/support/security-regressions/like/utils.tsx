import React from "react";
import { User, UserManager } from "oidc-client-ts";
import { AuthProvider } from "react-oidc-context";
import { EndpointContext, type EndpointContextType } from "../../../../src/components/EndpointContext";
import type { LikeProps } from "../../../../src/components/shared/Like/Like";
import { LikeSecurityProbe } from "../LikeSecurityProbe";

export const createLikeSecurityFixture = (authenticated = true) => {
    const authUrl = "https://active-market.example";
    const manager = new UserManager({
        authority: `${authUrl}/api/auth`,
        client_id: "security-fixture",
        redirect_uri: "https://frontend.example/auth/callback",
        automaticSilentRenew: false,
    });
    const now = Math.floor(Date.now() / 1000);
    cy.stub(manager, "getUser").resolves(
        authenticated
            ? new User({
                  access_token: "fixture-only-token",
                  token_type: "Bearer",
                  expires_at: now + 3600,
                  profile: {
                      iss: `${authUrl}/api/auth`,
                      aud: "security-fixture",
                      sub: "alice",
                      iat: now,
                      exp: now + 3600,
                      email_verified: true,
                  },
              })
            : null,
    );
    const endpoint: EndpointContextType = {
        authUrl,
        urls: [{ value: authUrl, name: "Active", enabled: true }],
        enabled: [authUrl],
        setUrls: cy.stub(),
        setAuthUrl: cy.stub().as("switchAuthServer"),
        setPendingAction: cy.stub(),
        isSyndicationLoading: false,
    };
    return { manager, endpoint };
};

export const renderLikeSecurity = (props: LikeProps, fixture: ReturnType<typeof createLikeSecurityFixture>) => (
    <AuthProvider userManager={fixture.manager} skipSigninCallback>
        <EndpointContext.Provider value={fixture.endpoint}>
            <LikeSecurityProbe {...props} />
        </EndpointContext.Provider>
    </AuthProvider>
);
