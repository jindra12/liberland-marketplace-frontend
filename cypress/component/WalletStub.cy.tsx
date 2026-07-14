import { detailRoute, COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { fillFormField, mountAnonymousRoute, screenshotStep } from "../support/component-tests/utils";

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
    cy.get(".ProductDetail").should("be.visible");
    screenshotStep(`wallet-stub-product-${id}`);
};

const openOrderPaymentPage = () => {
    openProduct(
        COOP_SERVER_URL,
        detailRoute("/products-services", "coop-product-lighthouse-kit", COOP_SERVER_URL),
        "coop-product-lighthouse-kit",
        "Lighthouse Kit",
    );
    openProduct(MAIN_SERVER_URL, detailRoute("/products-services", "product-solar-rig"), "product-solar-rig", "Solar Rig");
    openProduct(MAIN_SERVER_URL, detailRoute("/products-services", "product-shore-kit"), "product-shore-kit", "Shore Kit");
    openProduct(
        COOP_SERVER_URL,
        detailRoute("/products-services", "coop-product-harbor-ether-lantern", COOP_SERVER_URL),
        "coop-product-harbor-ether-lantern",
        "Harbor Ether Lantern",
    );
    openProduct(COOP_SERVER_URL, detailRoute("/products-services", "coop-product-tide-lamp", COOP_SERVER_URL), "coop-product-tide-lamp", "Tide Lamp");

    cy.routerNavigate("/cart");
    cy.contains("Proceed to order").click();
    cy.contains("h2", "Order").should("be.visible");
    screenshotStep("wallet-stub-order-form");
    fillOrderAddress();
    cy.contains("button", "Create order").click();
    cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
    screenshotStep("wallet-stub-payment-page");
};

const payWallet = (paymentCard: string, chainLabel: string, screenshotName: string) => {
    cy.contains(".ant-card", paymentCard).within(() => {
        cy.contains(chainLabel)
            .parents(".ant-list-item")
            .first()
            .within(() => {
                cy.contains("button", "Connect").click();
                cy.contains("button", "Pay").should("be.visible").click();
                cy.contains("Payment submitted").should("be.visible");
                screenshotStep(screenshotName);
            });
    });
};

describe("wallet stubs", () => {
    it("connects wallets and completes the fake payment flow", () => {
        openOrderPaymentPage();
        payWallet("1st payment", "Ethereum (ETH)", "wallet-stub-ethereum-paid");
        payWallet("1st payment", "Solana (SOL)", "wallet-stub-solana-paid");
        payWallet("2nd payment", "Tron (TRX)", "wallet-stub-tron-paid");
    });
});
