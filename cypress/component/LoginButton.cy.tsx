import { UserManager } from "oidc-client-ts";

import { LoginButton } from "../../src/components/LoginButton";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountMainRoute, screenshotStep } from "../support/component-tests/utils";

type SigninRequestClient = {
    createSigninRequest: (args: { request_type: "si:r" }) => Promise<{ url: string }>;
};

type SigninRedirectUserManager = UserManager & {
    _client: SigninRequestClient;
};
type SigninRedirectArgs = Parameters<SigninRedirectUserManager["signinRedirect"]>[0];

const buildAuthStorageKey = (serverUrl: string) => {
    return `oidc.user:${serverUrl}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;
};

const buildEndpointUrls = (serverUrls: string[]) => {
    return serverUrls.map((serverUrl, index) => ({
        enabled: true,
        value: serverUrl,
        name: index === 0 ? "Main" : index === 1 ? "Co-op" : `Server ${index + 1}`,
    }));
};

const seedLoggedInServer = (win: Window, serverUrl: string) => {
    const now = Math.floor(Date.now() / 1000);
    const storageValue = {
        access_token: "mock-login-button-access-token",
        token_type: "Bearer",
        scope: "openid profile email",
        expires_at: now + 3600,
        profile: {
            iss: `${serverUrl}/api/auth`,
            aud: "frontend-app",
            exp: now + 3600,
            iat: now,
            sub: "user-nova",
            email: "nova@example.test",
            email_verified: true,
            name: "Nova Rivers",
            picture: "https://example.test/nova.png",
        },
    };

    win.localStorage.setItem(buildAuthStorageKey(serverUrl), JSON.stringify(storageValue));
};

const mountLoginButton = (route: string, serverUrls: string[], loggedInServerUrls: string[] = []) => {
    cy.window().then((win) => {
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        loggedInServerUrls.forEach((serverUrl) => seedLoggedInServer(win, serverUrl));
    });

    mountMainRoute(route);
};

describe("login button", () => {
    const expectLoginButtonTextSizeToMatchCreateButton = () => {
        cy.get(".AppHeader__publishBtn").then(($createButton) => {
            const createButtonFontSize = window.getComputedStyle($createButton[0]).fontSize;
            cy.get(".LoginButton").then(($loginButton) => {
                const loginButtonFontSize = window.getComputedStyle($loginButton[0]).fontSize;

                expect(loginButtonFontSize).to.equal(createButtonFontSize);
            });
        });
    };

    const expectLoginButtonIconToSitBeforeText = () => {
        cy.get(".LoginButton .ant-btn-icon").then(($icon) => {
            cy.get(".LoginButton__label").then(($text) => {
                    const iconRect = $icon[0].getBoundingClientRect();
                    const textRect = $text[0].getBoundingClientRect();

                    expect(iconRect.right).to.be.lessThan(textRect.left);
                });
        });
    };

    const expectLoginPopupToHaveNoScrollTrackForTwoEntries = () => {
        cy.get(".LoginButton__menu .ant-dropdown-menu").then(($menu) => {
            expect($menu[0].scrollHeight).to.be.at.most($menu[0].clientHeight);
        });
    };

    it("shows login servers and signs in to the selected server", () => {
        cy.viewport(1440, 1200);
        mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL]);
        expectLoginButtonTextSizeToMatchCreateButton();

        let redirectUrl = "";
        let signinRedirectArgs: SigninRedirectArgs | undefined;
        cy.stub(UserManager.prototype, "signinRedirect").callsFake(async function (
            this: SigninRedirectUserManager,
            args?: SigninRedirectArgs,
        ) {
            signinRedirectArgs = args;
            const signinRequest = await this._client.createSigninRequest({
                request_type: "si:r",
            });

            redirectUrl = signinRequest.url;
        });

        cy.contains(".LoginButton", "Log in", { timeout: 20000 }).should("be.visible").click();
        cy.get(".LoginButton__menu", { timeout: 20000 }).should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log in", { timeout: 20000 }).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log out").should("not.exist");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        screenshotStep("login-button-anonymous-tree");

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").click({ force: true });

        cy.wrap(null, { timeout: 20000 }).should(() => {
            expect(redirectUrl).to.not.equal("");
            expect(signinRedirectArgs?.state).to.equal("/jobs");
            const parsedUrl = new URL(redirectUrl);

            expect(parsedUrl.origin).to.equal(COOP_SERVER_URL);
            expect(parsedUrl.pathname).to.equal("/api/auth/oauth2/authorize");
            expect(parsedUrl.searchParams.get("client_id")).to.be.a("string");
            expect(parsedUrl.searchParams.get("scope")).to.equal("openid profile email");
            expect(parsedUrl.searchParams.get("redirect_uri")).to.be.a("string");
        });
    });

    it("shows logged in and logged out servers in separate tree groups", () => {
        cy.viewport(1440, 1200);
        mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL], [MAIN_SERVER_URL]);
        expectLoginButtonTextSizeToMatchCreateButton();

        cy.contains(".LoginButton", "Accounts", { timeout: 20000 }).should("be.visible").click();
        cy.get(".LoginButton__menu", { timeout: 20000 }).should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log in", { timeout: 20000 }).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log out", { timeout: 20000 }).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        screenshotStep("login-button-mixed-tree");
    });

    it("logs out from the selected server", () => {
        cy.viewport(1440, 1200);
        mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL], [MAIN_SERVER_URL]);
        expectLoginButtonTextSizeToMatchCreateButton();

        let removeUserCalled = false;
        const originalRemoveUser = UserManager.prototype.removeUser;
        cy.stub(UserManager.prototype, "removeUser").callsFake(async function (this: any) {
            removeUserCalled = true;
            await originalRemoveUser.call(this);
        });

        cy.contains(".LoginButton", "Accounts", { timeout: 20000 }).should("be.visible").click();
        cy.get(".LoginButton__menu", { timeout: 20000 }).should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log out", { timeout: 20000 }).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log in").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        screenshotStep("login-button-logout-tree");

        cy.get(".LoginButton__menu .ant-dropdown-menu-item")
            .filter(":contains('Main')")
            .last()
            .click({ force: true });

        cy.wrap(null, { timeout: 20000 }).should(() => {
            expect(removeUserCalled).to.be.true;
            expect(window.localStorage.getItem(buildAuthStorageKey(MAIN_SERVER_URL))).to.be.null;
        });
        cy.get(".LoginButton__menu", { timeout: 20000 }).should("not.be.visible");
    });
});
