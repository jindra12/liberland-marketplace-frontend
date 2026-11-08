import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "react-oidc-context";
import { AntProvider } from "../../../../src/components/AntProvider";
import { EndpointContext, type EndpointContextType } from "../../../../src/components/EndpointContext";
import { buildTestAuthContext } from "../../component-tests/mountBasic";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../../component-tests/constants";

export const mountPublicFederatedList = (
    component: React.ReactNode,
    client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
    options: { authUrl?: string; authenticated?: boolean; route?: string; withoutRouter?: boolean } = {},
) => {
    const endpoint: EndpointContextType = {
        authUrl: options.authUrl || MAIN_SERVER_URL,
        enabled: [MAIN_SERVER_URL, COOP_SERVER_URL],
        urls: [MAIN_SERVER_URL, COOP_SERVER_URL].map((value) => ({ value, name: value, enabled: true })),
        isSyndicationLoading: false,
        setUrls: cy.stub(),
        setAuthUrl: cy.stub().as("selectAuthServer"),
        setPendingAction: cy.stub().as("queueAuthAction"),
    };
    return mount(
        <AntProvider>
            <QueryClientProvider client={client}>
                <EndpointContext.Provider value={endpoint}>
                    <AuthContext.Provider
                        value={buildTestAuthContext({ isAuthenticated: Boolean(options.authenticated) })}
                    >
                        {options.withoutRouter ? (
                            component
                        ) : (
                            <MemoryRouter initialEntries={[options.route || "/"]}>{component}</MemoryRouter>
                        )}
                    </AuthContext.Provider>
                </EndpointContext.Provider>
            </QueryClientProvider>
        </AntProvider>,
    );
};
