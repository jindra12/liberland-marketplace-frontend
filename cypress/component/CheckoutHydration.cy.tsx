import React from "react";
import { mount } from "cypress/react";
import { MemoryRouter } from "react-router-dom";
import { McpCheckoutHydrator } from "../../src/components/order/McpCheckoutHydrator";
import { CART_SECRETS_INDEX_KEY } from "../../src/components/cart/cartSecrets";

describe("Checkout capability hydration", { retries: 0 }, () => {
    it("preserves carts belonging to other backends when accepting a checkout handoff", () => {
        const existing = { url: "https://existing-market.example", secret: "existing-cart-capability" };
        const incoming = { serverUrl: "https://checkout-market.example", secret: "incoming-cart-capability" };
        cy.window().then((win) => {
            win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify([existing]));
        });
        mount(
            <MemoryRouter
                initialEntries={[
                    `/order?mcpCheckout=${encodeURIComponent(btoa(JSON.stringify({ carts: [incoming] })))}`,
                ]}
            >
                <McpCheckoutHydrator />
            </MemoryRouter>,
        );
        cy.contains("button", "Use these carts").click();
        cy.window().should((win) => {
            expect(win.localStorage.getItem(CART_SECRETS_INDEX_KEY)).to.contain(incoming.secret);
            expect(win.localStorage.getItem(CART_SECRETS_INDEX_KEY)).to.contain(existing.secret);
        });
    });

    it("does not silently trust a new backend supplied by an arbitrary checkout link", () => {
        const incoming = { serverUrl: "https://untrusted-market.example", secret: "attacker-selected-capability" };
        mount(
            <MemoryRouter
                initialEntries={[
                    `/order?mcpCheckout=${encodeURIComponent(btoa(JSON.stringify({ carts: [incoming] })))}`,
                ]}
            >
                <McpCheckoutHydrator />
            </MemoryRouter>,
        );
        cy.contains("Review checkout servers").should("exist");
        cy.window().then((win) => {
            expect(win.localStorage.getItem(CART_SECRETS_INDEX_KEY) || "").not.to.contain(incoming.serverUrl);
        });
    });
});
