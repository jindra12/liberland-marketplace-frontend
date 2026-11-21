import React from "react";
import Order from "../../src/components/Order";
import { CART_SECRETS_INDEX_KEY } from "../../src/components/cart/cartSecrets";
import { seedAuthorizedProfile } from "../support/component-tests/auth";
import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    assertFormFieldValue,
    gqlAlias,
    screenshotStep,
    mountWithProviders,
    buildTestAuthContext,
} from "../support/component-tests/direct";

const mountOrder = (serverUrls: string[], cartSecrets: Record<string, string>) => {
    cy.window().then((win) => {
        win.localStorage.clear();
        const user = seedAuthorizedProfile(win, MAIN_SERVER_URL);
        serverUrls.filter((url) => url !== MAIN_SERVER_URL).forEach((url) => seedAuthorizedProfile(win, url));
        win.localStorage.setItem("endpoints.urls", JSON.stringify(serverUrls.map((url, index) => ({
            value: url,
            name: index === 0 ? "Main" : "Co-op",
            enabled: true,
        }))));
        win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify(
            Object.entries(cartSecrets).map(([url, secret]) => ({ url, secret })),
        ));
        mountWithProviders(<Order />, {
            route: "/order",
            clearStorage: false,
            auth: buildTestAuthContext({ isAuthenticated: true, user }),
        });
    });
};

const assertMainOrderPrefill = () => {
    assertFormFieldValue("Email", "nova@example.test");
    assertFormFieldValue("First name", "Nova");
    assertFormFieldValue("Last name", "Rivers");
};

const assertCoopOrderPrefill = () => {
    assertFormFieldValue("Email", "iris@example.test");
    assertFormFieldValue("First name", "Iris");
    assertFormFieldValue("Last name", "Shore");
    assertFormFieldValue("Address line 1", "8 Dockside Lane");
    assertFormFieldValue("Address line 2", "Unit 3");
    assertFormFieldValue("City", "North Port");
    assertFormFieldValue("State / Region", "Coast");
    assertFormFieldValue("Postal code", "22001");
    assertFormFieldValue("Country", "Liberland");
};

describe("authenticated cart", () => {
    it("prefills the order form from the main server me query", () => {
        mountOrder([MAIN_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        });
        cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "CartBySecret", { secret: "alpha-secret" })}`);
        cy.contains("h2", "Order").should("be.visible");
        cy.get(".AddToCartButton__buyNow").should("not.exist");
        assertMainOrderPrefill();
        screenshotStep("authenticated-cart-main-prefill", "viewport");
    });

    it("lets the user switch to a shipping address from another logged-in server", () => {
        mountOrder([MAIN_SERVER_URL, COOP_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        });
        cy.wait(`@${gqlAlias(MAIN_SERVER_URL, "CartBySecret", { secret: "alpha-secret" })}`);
        cy.contains("h2", "Order").should("be.visible");
        cy.get(".AddToCartButton__buyNow").should("not.exist");

        cy.contains("button", "Choose default address").should("be.visible").click();

        cy.contains(".ShippingAddressSelectModal", "Choose a default shipping address").should("be.visible");
        cy.contains(".ShippingAddressSelectModal__option", "Nova Rivers").should("be.visible");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore").should("be.visible");
        cy.get(".ShippingAddressSelectModal").should("have.css", "opacity", "1");
        screenshotStep("authenticated-cart-shipping-address-picker", "viewport");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore").should("be.visible").click();

        assertCoopOrderPrefill();
        cy.get(".ShippingAddressSelectModal").should("not.exist");
        screenshotStep("authenticated-cart-coop-prefill", "viewport");
    });
});
