import React from "react";

import { User } from "oidc-client-ts";
import { Route, Routes } from "react-router-dom";

import PostDetail from "../../../src/components/detail/PostDetail";
import { detailRoute, MAIN_SERVER_URL } from "../../support/component-tests/constants";
import { buildTestAuthContext, mountWithProviders } from "../../support/component-tests/directBasic";
import { seedAuthorizedProfile } from "../../support/component-tests/utils";

export const mountPostDetail = (emailVerified = true) => {
    cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
        const body = req.body as { operationName?: string; query?: string };
        if (body.operationName === "PostById" || body.query?.includes("PostById")) {
            req.alias = "postById";
        }
    });

    const auth = buildTestAuthContext();
    mountWithProviders(
        <Routes>
            <Route path="/posts/:id/:serverUrl" element={<PostDetail />} />
        </Routes>,
        {
            route: detailRoute("/posts", "post-harbor-operations-digest"),
            auth: buildTestAuthContext({
                isAuthenticated: true,
                settings: { ...auth.settings, authority: `${MAIN_SERVER_URL}/api/auth` },
                user: new User({
                    access_token: "mock-profile-access-token",
                    token_type: "Bearer",
                    scope: "openid profile email",
                    expires_at: 2000000000,
                    profile: {
                        sub: "user-nova",
                        email: "nova@example.test",
                        email_verified: emailVerified,
                        iss: `${MAIN_SERVER_URL}/api/auth`,
                        aud: "frontend-app",
                        exp: 2000000000,
                        iat: 1900000000,
                    },
                }),
            }),
            setup: (win) => seedAuthorizedProfile(win, MAIN_SERVER_URL, emailVerified),
        },
    );

    cy.wait("@postById").its("response.statusCode").should("equal", 200);
    cy.contains(".PostDetail", "Harbor Operations Digest").should("be.visible");
};
