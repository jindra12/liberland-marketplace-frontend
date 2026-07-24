import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mount } from "cypress/react";
import { BrowserRouter } from "react-router-dom";
import { AuthContext, type AuthContextProps } from "react-oidc-context";
import { User } from "oidc-client-ts";

import { AntProvider } from "../../../src/components/AntProvider";
import { AppAnalyticsProvider } from "../../../src/components/analytics/AppAnalyticsProvider";
import { CartMutationProvider } from "../../../src/components/cart/CartMutationContext";
import { createAuthManager } from "../../../src/components/auth/utils";
import { MAIN_SERVER_URL } from "./constants";
import { TestEndpointContextProvider } from "./testEndpointContext";

type MountWithProvidersOptions = {
    auth?: AuthContextProps;
    route?: string;
    setup?: (win: Window) => void;
    clearStorage?: boolean;
};

export const createTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                retry: false,
            },
            mutations: {
                retry: false,
            },
        },
    });

const buildMockUser = () =>
    new User({
        access_token: "mock-access-token",
        token_type: "Bearer",
        scope: "openid profile email",
        profile: {
            sub: "user-nova",
            iss: "http://127.0.0.1:3010/api/auth",
            aud: "frontend-app",
            exp: 2000000000,
            iat: 1900000000,
        },
        expires_at: 2000000000,
    });

export const buildDefaultAuthContext = (): AuthContextProps => {
    const userManager = createAuthManager(MAIN_SERVER_URL);

    return {
        isAuthenticated: false,
        isLoading: false,
        user: undefined,
        error: undefined,
        activeNavigator: undefined,
        activeNavigatorError: undefined,
        isDisabled: false,
        removeUser: async () => undefined,
        signinRedirect: async () => undefined,
        signinSilent: async () => buildMockUser(),
        signoutRedirect: async () => undefined,
        signoutSilent: async () => undefined,
        signinPopup: async () => buildMockUser(),
        signoutPopup: async () => undefined,
        querySessionStatus: async () => null,
        signinResourceOwnerCredentials: async () => buildMockUser(),
        revokeTokens: async () => undefined,
        clearStaleState: async () => undefined,
        events: userManager.events,
        settings: {
            authority: "",
            client_id: "",
            response_type: "",
            redirect_uri: "",
            scope: "",
        },
        metadata: undefined,
        metadataService: undefined,
        revokeTokensOnSignout: false,
        stopSilentRenew: () => undefined,
        startSilentRenew: () => undefined,
        signinRedirectCallback: async () => undefined,
        signoutRedirectCallback: async () => undefined,
        signinPopupCallback: async () => undefined,
        signoutPopupCallback: async () => undefined,
        signoutPopupCallbackRedirectUrl: undefined,
        removeUserData: async () => undefined,
        getUser: async () => buildMockUser(),
        userManager: undefined,
    } as AuthContextProps;
};

export const buildTestAuthContext = (overrides: Partial<AuthContextProps> = {}): AuthContextProps => {
    return {
        ...buildDefaultAuthContext(),
        ...overrides,
    };
};

export const mountWithProviders = (ui: React.ReactNode, options: MountWithProvidersOptions = {}) => {
    const queryClient = createTestQueryClient();

    cy.window().then((win) => {
        if (options.clearStorage !== false) {
            win.localStorage.clear();
        }
        if (options.route !== undefined) {
            win.history.pushState({}, "", options.route);
        }
        options.setup?.(win);
    });

    mount(
        <AntProvider>
            <QueryClientProvider client={queryClient}>
                <AppAnalyticsProvider>
                    <TestEndpointContextProvider>
                        <CartMutationProvider>
                            <AuthContext.Provider value={options.auth || buildDefaultAuthContext()}>
                                <BrowserRouter>{ui}</BrowserRouter>
                            </AuthContext.Provider>
                        </CartMutationProvider>
                    </TestEndpointContextProvider>
                </AppAnalyticsProvider>
            </QueryClientProvider>
        </AntProvider>,
    );
};
