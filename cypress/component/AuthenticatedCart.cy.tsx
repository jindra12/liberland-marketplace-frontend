import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { assertFormFieldValue, mountAuthenticatedCartRoute, screenshotStep } from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

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
        mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        }, true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        cy.contains("Filter by tribe").should("not.exist");
        cy.contains("No more results").should("not.exist");
        cy.contains(".CartPage__orderButton", "Proceed to order", { timeout: 20000 })
            .should("be.visible")
            .click();

        cy.contains("h2", "Order").should("be.visible");
        screenshotStep("authenticated-cart-main-prefill");

        assertMainOrderPrefill();
    });

    it("lets the user switch to a shipping address from another logged-in server", () => {
        mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL, COOP_SERVER_URL], {
            [MAIN_SERVER_URL]: "alpha-secret",
        }, true, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        cy.contains("Filter by tribe").should("not.exist");
        cy.contains("No more results").should("not.exist");
        cy.contains(".CartPage__orderButton", "Proceed to order", { timeout: 20000 })
            .should("be.visible")
            .click();

        cy.contains("h2", "Order").should("be.visible");

        cy.contains("button", "Choose default address").should("be.visible").click();

        cy.contains(".ShippingAddressSelectModal", "Choose a default shipping address").should("be.visible");
        screenshotStep("authenticated-cart-shipping-address-picker");
        cy.contains(".ShippingAddressSelectModal__option", "Nova Rivers").should("be.visible");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore").should("be.visible").click();

        screenshotStep("authenticated-cart-coop-prefill");
        assertCoopOrderPrefill();
    });
});
