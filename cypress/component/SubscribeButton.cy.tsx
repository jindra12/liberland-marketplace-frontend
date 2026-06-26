import { createHash } from "crypto";

import { mount } from "cypress/react";
import { User } from "oidc-client-ts";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { AuthContextProvider } from "../../src/components/AuthContext";
import { EndpointContextProvider } from "../../src/components/EndpointContext";
import { AUTH_URL_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { SubscribeButton } from "../../src/components/share/SubscribeButton/SubscribeButton";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";

type GraphQLRequestBody = {
    operationName?: string;
    query?: string;
    variables?: {
        subscriptionID?: string;
        targetID?: string;
        url?: string;
    };
};

const buildAuthStorageKey = (serverUrl: string) =>
    `oidc.user:${serverUrl}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;

const buildSubscriptionID = (email: string, targetCollection: string, targetID: string) =>
    createHash("sha256")
        .update(`${email.toLowerCase()}::${targetCollection}::${targetID}`)
        .digest("hex");

const seedAuthenticatedUser = (win: Window, serverUrl: string, email: string) => {
    const now = Math.floor(Date.now() / 1000);
    const user = new User({
        access_token: `${email}-access-token`,
        token_type: "Bearer",
        scope: "openid profile email",
        expires_at: now + 3600,
        profile: {
            iss: `${serverUrl}/api/auth`,
            aud: "frontend-app",
            exp: now + 3600,
            iat: now,
            sub: `${email}-sub`,
            email,
            email_verified: true,
            name: email,
        },
    });

    win.localStorage.setItem(buildAuthStorageKey(serverUrl), user.toStorageString());
};

const seedEndpoints = (win: Window) => {
    win.localStorage.setItem(
        "endpoints.urls",
        JSON.stringify([
            {
                enabled: true,
                value: MAIN_SERVER_URL,
                name: "Main",
            },
            {
                enabled: true,
                value: COOP_SERVER_URL,
                name: "Co-op",
            },
        ]),
    );
};

const mountSubscribeButton = () => {
    cy.window().then((win) => {
        seedEndpoints(win);
        win.localStorage.setItem(AUTH_URL_STORAGE_KEY, JSON.stringify(MAIN_SERVER_URL));
        seedAuthenticatedUser(win, MAIN_SERVER_URL, "main.user@example.test");
        seedAuthenticatedUser(win, COOP_SERVER_URL, "coop.user@example.test");
    });

    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
            },
        },
    });

    mount(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/companies/company-harbor-labs"]}>
                <EndpointContextProvider>
                    <AuthContextProvider>
                        <SubscribeButton
                            collection="companies"
                            targetID="company-harbor-labs"
                            serverURL={COOP_SERVER_URL}
                            isSubscribed
                        />
                    </AuthContextProvider>
                </EndpointContextProvider>
            </MemoryRouter>
        </QueryClientProvider>,
    );
};

describe("SubscribeButton", () => {
    it("derives the unsubscribe subscription id from the target server auth storage", () => {
        const expectedSubscriptionID = buildSubscriptionID(
            "coop.user@example.test",
            "companies",
            "company-harbor-labs",
        );

        cy.intercept("POST", "**/api/graphql", (req) => {
            const body = req.body as GraphQLRequestBody;

            if (body.operationName === "ListPublishedSyndicationUrls" || body.query?.includes("ListPublishedSyndicationUrls")) {
                req.reply({
                    data: {
                        Syndications: {
                            __typename: "Syndications",
                            docs: [],
                            totalDocs: 0,
                            limit: 20,
                            totalPages: 1,
                            page: 1,
                            hasPrevPage: false,
                            hasNextPage: false,
                            prevPage: null,
                            nextPage: null,
                        },
                    },
                });
                return;
            }

            if (body.operationName === "UnsubscribeFromCompanyUpdates" || body.query?.includes("UnsubscribeFromCompanyUpdates")) {
                req.alias = "unsubscribeCompany";
                req.reply({
                    data: {
                        deleteNotificationSubscription: {
                            __typename: "NotificationSubscription",
                            id: expectedSubscriptionID,
                        },
                    },
                });
            }
        });

        mountSubscribeButton();

        cy.contains(".SubscribeButton", "Unsubscribe", { timeout: 20000 }).should("be.visible").click();

        cy.wait("@unsubscribeCompany", { timeout: 20000 }).then((interception) => {
            expect(interception.request.url).to.equal(`${COOP_SERVER_URL}/api/graphql`);
            expect(interception.request.body.variables.subscriptionID).to.equal(expectedSubscriptionID);
            expect(interception.request.headers.authorization).to.equal("Bearer coop.user@example.test-access-token");
            expect(interception.request.body.variables.subscriptionID).to.match(/^[a-f0-9]{64}$/);
        });
    });
});
