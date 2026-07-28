import * as React from "react";

import { User } from "oidc-client-ts";

import { AUTH_URL_STORAGE_KEY } from "../../../src/components/endpoints/constants";
import { ProfileContent } from "../../../src/components/ProfileContent/ProfileContent";

import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../../support/component-tests/constants";
import {
    buildTestAuthContext,
    mountWithProviders,
    seedAuthorizedProfile,
} from "../../support/component-tests/utils";

export const buildProfileEndpointUrls = (serverUrls: string[]) => {
    return serverUrls.map((serverUrl, index) => ({
        enabled: true,
        value: serverUrl,
        name: index === 0 ? "Main" : index === 1 ? "Co-op" : `Server ${index + 1}`,
    }));
};

export const mountProfileContent = (serverUrls: string[] = [MAIN_SERVER_URL, COOP_SERVER_URL]) => {
    cy.intercept("POST", "**/api/graphql", (req) => {
        const body = req.body as { operationName?: string; query?: string };

        if (body.operationName === "MeUser" || body.query?.includes("MeUser")) {
            req.alias = "profileMeUser";
        }

        if (body.operationName === "UpdateUserById" || body.query?.includes("UpdateUserById")) {
            req.alias = "updateUserById";
        }
    });

    mountWithProviders(<ProfileContent />, {
        auth: buildTestAuthContext({
            isAuthenticated: true,
            user: new User({
                access_token: "mock-profile-access-token",
                token_type: "Bearer",
                scope: "openid profile email",
                profile: {
                    sub: "user-nova",
                    email: "nova@example.test",
                    email_verified: true,
                    name: "Nova Rivers",
                    picture: "https://example.test/nova.png",
                    iss: "http://127.0.0.1:3010/api/auth",
                    aud: "frontend-app",
                    exp: 2000000000,
                    iat: 1900000000,
                },
                expires_at: 2000000000,
            }),
        }),
        route: "/profile",
        setup: (win) => {
            win.localStorage.setItem("endpoints.urls", JSON.stringify(buildProfileEndpointUrls(serverUrls)));
            win.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(serverUrls[0]));
            serverUrls.forEach((serverUrl) => seedAuthorizedProfile(win, serverUrl, true));
        },
    });

    cy.wait("@profileMeUser");
};

export const assertPasswordFormIsEmpty = () => {
    cy.contains(".Profile__card", "Change Password").within(() => {
        cy.get('input[type="password"]').should("have.length", 3);
        cy.get('input[type="password"]').each((input) => {
            expect(input).to.have.value("");
        });
    });
};

export const assertNicknameValue = (value: string) => {
    cy.contains(".Profile__card", "Change Nickname").should("be.visible").within(() => {
        cy.get("input").should("have.value", value);
    });
};

export const assertProfileMainDefaults = () => {
    assertNicknameValue("Nova Rivers");
    assertPasswordFormIsEmpty();

    cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
        cy.get('input[placeholder="Phone number"]').should("have.value", "+1 555 0001");
        cy.contains(".ant-form-item", "Address line 1").find("input").should("have.value", "1 Dockside Road");
        cy.contains(".ant-form-item", "Address line 2").find("input").should("have.value", "Apt 12");
        cy.contains(".ant-form-item", "City").find("input").should("have.value", "Port Sol");
        cy.contains(".ant-form-item", "State / Region").find("input").should("have.value", "Coast");
        cy.contains(".ant-form-item", "Postal code").find("input").should("have.value", "11001");
        cy.contains(".ant-form-item", "Country").find("input").should("have.value", "Liberland");
    });

    cy.get(".Profile__walletRow").should("have.length", 3);
    cy.get(".Profile__walletRow").eq(0).within(() => {
        cy.get(".ant-select-selection-item").should("contain.text", "Solana");
        cy.get('input[placeholder="Select a wallet"]').should("have.value", "phantom");
        cy.get('input[placeholder="Enter wallet address"]').should("have.value", "SoUserWallet1717");
    });
    cy.get(".Profile__walletRow").eq(1).within(() => {
        cy.get(".ant-select-selection-item").should("contain.text", "Ethereum");
        cy.get('input[placeholder="Select a wallet"]').should("have.value", "metamask");
        cy.get('input[placeholder="Enter wallet address"]').should("have.value", "0xUserWallet1818");
    });
    cy.get(".Profile__walletRow").eq(2).within(() => {
        cy.get(".ant-select-selection-item").should("contain.text", "Tron");
        cy.get('input[placeholder="Select a wallet"]').should("have.value", "TronLink Stub");
        cy.get('input[placeholder="Enter wallet address"]').should("have.value", "TUserWallet1919");
    });
};

export const assertProfileCoopDefaults = () => {
    assertNicknameValue("Iris Shore");
    assertPasswordFormIsEmpty();

    cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
        cy.get('input[placeholder="Phone number"]').should("have.value", "+1 555 0600");
        cy.contains(".ant-form-item", "Address line 1").find("input").should("have.value", "8 Dockside Lane");
        cy.contains(".ant-form-item", "Address line 2").find("input").should("have.value", "Unit 3");
        cy.contains(".ant-form-item", "City").find("input").should("have.value", "North Port");
        cy.contains(".ant-form-item", "State / Region").find("input").should("have.value", "Coast");
        cy.contains(".ant-form-item", "Postal code").find("input").should("have.value", "22001");
        cy.contains(".ant-form-item", "Country").find("input").should("have.value", "Liberland");
    });

    cy.get(".Profile__walletRow").should("have.length", 1);
    cy.get(".Profile__walletRow").eq(0).within(() => {
        cy.get(".ant-select-selection-item").should("contain.text", "Solana");
        cy.get('input[placeholder="Select a wallet"]').should("have.value", "phantom");
        cy.get('input[placeholder="Enter wallet address"]').should("have.value", "SoCoopWallet606");
    });
};
