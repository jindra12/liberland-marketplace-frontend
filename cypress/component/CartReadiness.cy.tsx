import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AddToCartButton } from "../../src/components/cart/AddToCartButton";
import { CartMutationProvider } from "../../src/components/cart/CartMutationContext";
import { CART_SECRETS_INDEX_KEY } from "../../src/components/cart/cartSecrets";
import { EndpointContext, type EndpointContextType } from "../../src/components/EndpointContext";
import type { CartBySecretQuery, CartBySecretQueryVariables, CreateCartMutationVariables, UpdateCartMutationVariables } from "../../src/generated/graphql";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";

describe("Existing cart recovery", { retries: 0 }, () => {
    it("recovers a failed read and adds to the original cart without replacing its secret", () => {
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const failedRead = cy.stub();
        const cart: CartBySecretQuery = { Carts: { totalDocs: 1, docs: [{ id: "existing-cart", items: [] }] } };
        const create = cy.stub().as("createReplacement");
        const update = cy.stub().as("updateExisting");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            const body = request.body as {
                query: string;
                variables: CartBySecretQueryVariables | CreateCartMutationVariables | UpdateCartMutationVariables;
            };
            if (body.query.includes("mutation CreateCart")) {
                create(body.variables);
                request.reply({ body: { errors: [{ message: "A replacement must not be created" }] } });
                return;
            }
            if (body.query.includes("mutation UpdateCart")) {
                update(body.variables);
                request.reply({ body: { data: { updateCart: { id: "existing-cart" } } } });
                return;
            }
            if (!failedRead.called) {
                failedRead();
                request.reply({ statusCode: 503, body: { error: "Temporarily unavailable" } });
                return;
            }
            request.reply({ body: { data: cart } });
        });
        const endpoint: EndpointContextType = {
            authUrl: MAIN_SERVER_URL,
            enabled: [MAIN_SERVER_URL],
            urls: [{ value: MAIN_SERVER_URL, name: "Fixture", enabled: true }],
            isSyndicationLoading: false,
            setUrls: cy.stub(), setAuthUrl: cy.stub(), setPendingAction: cy.stub(),
        };
        const secrets = [{ url: MAIN_SERVER_URL, secret: "existing-cart-secret" }];
        cy.window().then((win) => win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(secrets)));
        mount(
            <QueryClientProvider client={client}>
                <EndpointContext.Provider value={endpoint}>
                    <CartMutationProvider>
                        <AddToCartButton productId="new-product" serverURL={MAIN_SERVER_URL} me={[]} hideBuyNowButton />
                    </CartMutationProvider>
                </EndpointContext.Provider>
            </QueryClientProvider>,
        );
        cy.contains("button", "Retry cart").should("be.visible");
        cy.get('button[aria-label="Add to cart"]').should("be.disabled");
        cy.contains("button", "Retry cart").click();
        cy.get('button[aria-label="Add to cart"]').should("not.be.disabled").click();
        cy.get("@updateExisting").should("have.been.calledOnce").and("have.been.calledWithMatch", {
            id: "existing-cart", data: { items: [{ product: "new-product", quantity: 1 }] },
        });
        cy.get("@createReplacement").should("not.have.been.called");
        cy.window().then((win) => {
            expect(JSON.parse(win.localStorage.getItem(CART_SECRETS_INDEX_KEY)!)).to.deep.equal(secrets);
        });
    });
});
