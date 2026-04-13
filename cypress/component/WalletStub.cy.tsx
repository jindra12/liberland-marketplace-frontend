import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { fillFormField, mountAnonymousRoute, screenshotStep, waitForDetailQuery } from "../support/component-tests/utils";

const anonymousCartSecrets = {
    [MAIN_SERVER_URL]: "anon-shopping-main-secret",
    [COOP_SERVER_URL]: "anon-shopping-coop-secret",
};

const fillOrderAddress = () => {
    fillFormField("Email", "wallet-stub@example.test");
    fillFormField("First name", "Wallet");
    fillFormField("Last name", "Stub");
    fillFormField("Address line 1", "100 Market Street");
    fillFormField("City", "Harbor City");
    fillFormField("Postal code", "99999");
    fillFormField("Country", "Liberland");
};

const openProduct = (serverUrl: string, route: string, id: string, title: string) => {
    mountAnonymousRoute(
        route,
        serverUrl === MAIN_SERVER_URL ? [MAIN_SERVER_URL, COOP_SERVER_URL] : [COOP_SERVER_URL, MAIN_SERVER_URL],
        anonymousCartSecrets,
    );
    waitForDetailQuery(serverUrl, "ProductById", { id }, "Product", id, title);
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
    screenshotStep(`wallet-stub-product-${id}`);
};

const openOrderPaymentPage = () => {
    openProduct(MAIN_SERVER_URL, "/products-services/product-harbor-lantern", "product-harbor-lantern", "Harbor Lantern");
    openProduct(MAIN_SERVER_URL, "/products-services/product-solar-widget", "product-solar-widget", "Solar Widget");
    openProduct(MAIN_SERVER_URL, "/products-services/product-solar-rig", "product-solar-rig", "Solar Rig");
    openProduct(MAIN_SERVER_URL, "/products-services/product-shore-kit", "product-shore-kit", "Shore Kit");
    openProduct(
        COOP_SERVER_URL,
        "/products-services/coop-product-harbor-ether-lantern",
        "coop-product-harbor-ether-lantern",
        "Harbor Ether Lantern",
    );
    openProduct(COOP_SERVER_URL, "/products-services/coop-product-tide-lamp", "coop-product-tide-lamp", "Tide Lamp");

    cy.routerNavigate("/cart");
    cy.contains("Proceed to order").click();
    cy.contains("h2", "Order").should("be.visible");
    screenshotStep("wallet-stub-order-form");
    fillOrderAddress();
    cy.contains("button", "Create order").click();
    cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
    screenshotStep("wallet-stub-payment-page");
};

describe("wallet stubs", () => {
    it("connects wallets and completes the fake payment flow", () => {
        openOrderPaymentPage();

        cy.contains(".ant-card", "1st payment").within(() => {
            cy.contains("Ethereum (ETH)")
                .parents(".ant-list-item")
                .first()
                .within(() => {
                    cy.contains("button", "Connect").click();
                    cy.contains("button", "Pay").should("be.visible").click();
                    cy.pause();
                    cy.contains("Payment submitted").should("be.visible");
                    screenshotStep("wallet-stub-ethereum-paid");
                });

            cy.contains("Solana (SOL)")
                .parents(".ant-list-item")
                .first()
                .within(() => {
                    cy.contains("button", "Connect").click();
                    cy.contains("button", "Pay").should("be.visible").click();
                    cy.pause();
                    cy.contains("Payment submitted").should("be.visible");
                    screenshotStep("wallet-stub-solana-paid");
                });

            cy.contains("Tron (TRX)")
                .parents(".ant-list-item")
                .first()
                .within(() => {
                    cy.contains("button", "Connect").click();
                    cy.contains("button", "Pay").should("be.visible").click();
                    cy.pause();
                    cy.contains("Payment submitted").should("be.visible");
                    screenshotStep("wallet-stub-tron-paid");
                });
        });
    });
});
