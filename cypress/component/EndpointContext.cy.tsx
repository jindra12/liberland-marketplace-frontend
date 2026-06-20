import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { mount } from "cypress/react";

import { EndpointContextProvider, useEndpointContext } from "../../src/components/EndpointContext";
import { AUTH_URL_STORAGE_KEY } from "../../src/components/endpoints/constants";

import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";

const buildEndpointUrls = (serverUrls: string[]) => {
    return serverUrls.map((serverUrl, index) => ({
        enabled: true,
        value: serverUrl,
        name: index === 0 ? "Main" : index === 1 ? "Co-op" : `Server ${index + 1}`,
    }));
};

const EndpointAuthUrlConsumer: React.FunctionComponent = () => {
    const { authUrl } = useEndpointContext();

    return <div className="EndpointAuthUrlConsumer">{authUrl}</div>;
};

const mountEndpointContext = (authUrl: string) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
                retry: false,
            },
        },
    });

    cy.intercept("POST", "**/api/graphql", (req) => {
        req.reply({
            data: {
                Syndications: {
                    docs: [],
                    totalDocs: 0,
                    limit: 20,
                    totalPages: 1,
                    page: 1,
                    hasPrevPage: false,
                    hasNextPage: false,
                },
            },
        });
    });

    mount(<div />);

    cy.window().then((win) => {
        win.localStorage.setItem("endpoints.urls", JSON.stringify(buildEndpointUrls([MAIN_SERVER_URL, COOP_SERVER_URL])));
        win.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(authUrl));
    });

    mount(
        <QueryClientProvider client={queryClient}>
            <EndpointContextProvider>
                <EndpointAuthUrlConsumer />
            </EndpointContextProvider>
        </QueryClientProvider>,
    );
};

describe("endpoint context", () => {
    it("restores the selected auth server from local storage", () => {
        mountEndpointContext(COOP_SERVER_URL);

        cy.get(".EndpointAuthUrlConsumer", { timeout: 20000 })
            .should("be.visible")
            .and("have.text", COOP_SERVER_URL);
    });
});
