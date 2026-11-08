import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { AuthContext } from "react-oidc-context";
import Order from "../../../../src/components/Order";
import { AntProvider } from "../../../../src/components/AntProvider";
import { CartMutationProvider } from "../../../../src/components/cart/CartMutationContext";
import { CART_SECRETS_INDEX_KEY } from "../../../../src/components/cart/cartSecrets";
import { SAVED_SHIPPING_ADDRESS_STORAGE_KEY } from "../../../../src/components/order/constants";
import { EndpointContext, type EndpointContextType } from "../../../../src/components/EndpointContext";
import type { CartBySecretQuery } from "../../../../src/generated/graphql";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../../component-tests/constants";
import { buildTestAuthContext } from "../../component-tests/mountBasic";

export const mountCheckoutSecurityFixture = (failure: "later-order" | "cart-delete" | "refresh" | "success") => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
    const servers = failure === "later-order" ? [MAIN_SERVER_URL, COOP_SERVER_URL] : [MAIN_SERVER_URL];
    const reads = { paused: false };
    const gate = Promise.withResolvers<void>();
    const refresh = { work: Promise.resolve() };
    const readStarted = cy.stub().as("checkoutReadStarted");
    const created = cy.stub().as("createdOrder");
    const endpoint: EndpointContextType = {
        authUrl: MAIN_SERVER_URL,
        enabled: servers,
        urls: servers.map((value) => ({ value, name: value, enabled: true })),
        isSyndicationLoading: false,
        setUrls: cy.stub(),
        setAuthUrl: cy.stub(),
        setPendingAction: cy.stub(),
    };
    servers.forEach((serverUrl, index) => {
        const cart: CartBySecretQuery = {
            Carts: {
                totalDocs: 1,
                docs: [
                    {
                        id: `cart-${index}`,
                        items: [
                            {
                                quantity: 1,
                                product: { id: `product-${index}`, name: `Product ${index}`, serverURL: serverUrl },
                            },
                        ],
                    },
                ],
            },
        };
        cy.intercept<{ query: string }>("POST", `${serverUrl}/api/graphql`, async (request) => {
            if (request.body.query.includes("CartBySecret")) {
                if (reads.paused) {
                    readStarted();
                    await gate.promise;
                }
                request.alias = "checkoutCart";
                request.reply({ body: { data: cart } });
                return;
            }
            if (request.body.query.includes("CreateOrder")) {
                if (failure === "later-order" && index === 1) {
                    request.alias = "failedCheckout";
                    request.reply({ statusCode: 503, body: { errors: [{ message: "Second backend unavailable" }] } });
                } else {
                    created("created-order");
                    request.reply({ body: { data: { createOrder: { id: "created-order", items: [] } } } });
                }
                return;
            }
            if (request.body.query.includes("DeleteCart")) {
                if (failure === "cart-delete") {
                    request.alias = "failedCheckout";
                    request.reply({ statusCode: 503, body: { errors: [{ message: "Cart deletion unavailable" }] } });
                } else {
                    request.reply({ body: { data: { deleteCart: { id: `cart-${index}` } } } });
                }
                return;
            }
            request.reply({
                statusCode: 500,
                body: { errors: [{ message: "Unexpected checkout fixture operation" }] },
            });
        });
    });
    cy.window().then((win) => {
        win.localStorage.setItem(
            CART_SECRETS_INDEX_KEY,
            JSON.stringify(servers.map((url, index) => ({ url, secret: `cart-secret-${index}` }))),
        );
        win.localStorage.setItem(
            SAVED_SHIPPING_ADDRESS_STORAGE_KEY,
            JSON.stringify({
                id: "shipping",
                email: "alice@example.test",
                firstName: "Alice",
                lastName: "Fixture",
                addressLine1: "1 Test Street",
                city: "Test City",
                country: "Liberland",
                postalCode: "10000",
            }),
        );
    });
    const mountOrder = (cache: QueryClient) =>
        mount(
            <AntProvider>
                <QueryClientProvider client={cache}>
                    <EndpointContext.Provider value={endpoint}>
                        <AuthContext.Provider value={buildTestAuthContext()}>
                            <CartMutationProvider>
                                <MemoryRouter initialEntries={["/order"]}>
                                    <Order />
                                </MemoryRouter>
                            </CartMutationProvider>
                        </AuthContext.Provider>
                    </EndpointContext.Provider>
                </QueryClientProvider>
            </AntProvider>,
        );
    mountOrder(client);
    return {
        client,
        reads,
        gate,
        refresh,
        mountAgain: () => mountOrder(new QueryClient({ defaultOptions: client.getDefaultOptions() })),
    };
};
