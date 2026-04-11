import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { assertFormFieldValue, mountAuthenticatedCartRoute } from "../support/component-tests/utils";

const assertMainOrderPrefill = () => {
    assertFormFieldValue("Email", "nova@example.test");
    assertFormFieldValue("First name", "Nova");
    assertFormFieldValue("Last name", "Rivers");
    assertFormFieldValue("Country", "United States");
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
        mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        });

        cy.contains(".CartPage__orderButton", "Proceed to order", { timeout: 20000 })
            .should("be.visible")
            .click();

        cy.contains("h2", "Order").should("be.visible");
        cy.screenshot("authenticated-cart-main-prefill", {
            capture: "fullPage",
        });

        assertMainOrderPrefill();
    });

    it("lets the user switch to a shipping address from another logged-in server", () => {
        mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL, COOP_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        });

        cy.contains(".CartPage__orderButton", "Proceed to order", { timeout: 20000 })
            .should("be.visible")
            .click();

        cy.contains("h2", "Order").should("be.visible");

        cy.contains("button", "Choose default address").should("be.visible").click();

        cy.contains(".ShippingAddressSelectModal", "Choose a default shipping address").should("be.visible");
        cy.screenshot("authenticated-cart-shipping-address-picker", {
            capture: "fullPage",
        });
        cy.contains(".ShippingAddressSelectModal__option", "Nova Rivers").should("be.visible");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore").should("be.visible").click();

        cy.screenshot("authenticated-cart-coop-prefill", {
            capture: "fullPage",
        });
        assertCoopOrderPrefill();
    });
});
