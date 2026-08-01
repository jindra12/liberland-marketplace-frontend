import { LoginButton } from "../../src/components/LoginButton";
import { EndpointPendingActionHost } from "../../src/components/EndpointPendingActionHost";
import { AUTH_URL_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { buildTestAuthContext, mountWithProviders, screenshotStep } from "../support/component-tests/utils";

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
    const signinRedirect = cy.stub().resolves();
    let currentWindow: Window | undefined;
    const removeUser = cy.stub().callsFake(async () => {
        loggedInServerUrls.forEach((serverUrl) => {
            currentWindow?.localStorage.removeItem(buildAuthStorageKey(serverUrl));
        });
    });

    mountWithProviders(
        <>
            <LoginButton />
            <EndpointPendingActionHost />
        </>,
        {
        auth: buildTestAuthContext({
            signinRedirect,
            removeUser,
        }),
        route,
        setup: (win) => {
            currentWindow = win;
            win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls(serverUrls)));
            win.localStorage.setItem(AUTH_URL_STORAGE_KEY, serverUrls[0]);
            loggedInServerUrls.forEach((serverUrl) => seedLoggedInServer(win, serverUrl));
        },
        },
    );

    return {
        removeUser,
        signinRedirect,
    };
};

describe("login button", () => {
    const expectLoginButtonHasLargeSize = () => {
        cy.get(".LoginButton").should("have.class", "ant-btn-lg");
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
        const authSpies = mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL]);
        expectLoginButtonHasLargeSize();

        cy.contains(".LoginButton", "Log in").should("be.visible").click();
        cy.get(".LoginButton__menu").should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", /log in/i).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", "Log out").should("not.exist");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        screenshotStep("login-button-anonymous-tree");

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").click({ force: true });

        cy.wrap(null).should(() => {
            expect(authSpies.signinRedirect).to.have.been.calledOnceWith({
                state: "/jobs",
            });
            expect(JSON.parse(window.localStorage.getItem(AUTH_URL_STORAGE_KEY) || "\"\"")).to.equal(
                COOP_SERVER_URL,
            );
        });
    });

    it("logs in directly when there is only one available login server", () => {
        cy.viewport(1440, 1200);
        const authSpies = mountLoginButton("/jobs", [MAIN_SERVER_URL]);
        expectLoginButtonHasLargeSize();

        cy.contains(".LoginButton", "Log in").should("be.visible").click();
        cy.get(".LoginButton__menu").should("not.exist");
        expectLoginButtonIconToSitBeforeText();

        cy.wrap(null).should(() => {
            expect(authSpies.signinRedirect).to.have.been.calledOnceWith({
                state: "/jobs",
            });
        });
    });

    it("logs out directly when there is only one available logged in server", () => {
        cy.viewport(1440, 1200);
        const authSpies = mountLoginButton("/jobs", [MAIN_SERVER_URL], [MAIN_SERVER_URL]);
        expectLoginButtonHasLargeSize();

        cy.contains(".LoginButton", "Accounts").should("be.visible").click();
        cy.get(".LoginButton__menu").should("not.exist");
        expectLoginButtonIconToSitBeforeText();

        cy.wrap(null).should(() => {
            expect(authSpies.removeUser.callCount).to.equal(1);
            expect(window.localStorage.getItem(buildAuthStorageKey(MAIN_SERVER_URL))).to.equal(null);
        });
    });

    it("shows logged in and logged out servers in separate tree groups", () => {
        cy.viewport(1440, 1200);
        mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL], [MAIN_SERVER_URL]);
        expectLoginButtonHasLargeSize();

        cy.contains(".LoginButton", "Accounts").should("be.visible").click();
        cy.get(".LoginButton__menu").should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", /log in/i).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", /log out/i).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        screenshotStep("login-button-mixed-tree");
    });

    it("logs out from the selected server", () => {
        cy.viewport(1440, 1200);
        const authSpies = mountLoginButton("/jobs", [MAIN_SERVER_URL, COOP_SERVER_URL], [MAIN_SERVER_URL]);
        expectLoginButtonHasLargeSize();

        cy.contains(".LoginButton", "Accounts").should("be.visible").click();
        cy.get(".LoginButton__menu").should("be.visible");
        expectLoginButtonIconToSitBeforeText();
        expectLoginPopupToHaveNoScrollTrackForTwoEntries();

        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", /log out/i).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item-group-title", /log in/i).should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Main").should("be.visible");
        cy.contains(".LoginButton__menu .ant-dropdown-menu-item", "Co-op").should("be.visible");
        screenshotStep("login-button-logout-tree");

        cy.get(".LoginButton__menu .ant-dropdown-menu-item")
            .filter(":contains('Main')")
            .last()
            .click({ force: true });

        cy.wrap(null).should(() => {
            expect(authSpies.removeUser.callCount).to.equal(1);
            expect(window.localStorage.getItem(buildAuthStorageKey(MAIN_SERVER_URL))).to.equal(null);
        });
        cy.get(".LoginButton__menu").should("not.be.visible");
    });
});
