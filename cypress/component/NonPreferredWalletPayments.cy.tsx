import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { fillFormField, mountAnonymousRoute } from "../support/component-tests/utils";

const anonymousCartSecrets = {
    [MAIN_SERVER_URL]: "non-preferred-wallet-main-secret",
    [COOP_SERVER_URL]: "non-preferred-wallet-coop-secret",
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
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
};

const openOrderPaymentPage = () => {
    openProduct(
        COOP_SERVER_URL,
        "/products-services/coop-product-lighthouse-kit",
        "coop-product-lighthouse-kit",
        "Lighthouse Kit",
    );
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
    fillOrderAddress();
    cy.contains("button", "Create order").click();
    cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
};

const payWithNonPreferredWallet = (paymentCard: string, chainLabel: string) => {
    cy.contains(".ant-card", paymentCard).within(() => {
        cy.contains(chainLabel)
            .parents(".ant-list-item")
            .first()
            .within(() => {
                cy.contains("button", "Connect").click();
                cy.contains("button", "Pay", { timeout: 20000 }).should("be.visible").click();
                cy.contains("Payment submitted", { timeout: 20000 }).should("be.visible");
            });
    });
};

describe("non-preferred wallet payments", () => {
    it("allows Solana, Thirdweb, and Tron payments with a non-preferred wallet", () => {
        openOrderPaymentPage();
        payWithNonPreferredWallet("1st payment", "Solana (SOL)");
        payWithNonPreferredWallet("1st payment", "Ethereum (ETH)");
        payWithNonPreferredWallet("2nd payment", "Tron (TRX)");
    });
});
