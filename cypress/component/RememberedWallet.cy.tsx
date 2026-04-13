import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    addToCart,
    fillFormField,
    mountAuthenticatedCartRoute,
    screenshotStep,
    waitForDetailQuery,
} from "../support/component-tests/utils";
import { connectThirdwebWalletStub, connectTronWalletStub, connectSolanaWalletStub } from "../support/walletStub/state";

const cartSecrets = {
    [MAIN_SERVER_URL]: "remembered-wallet-main-secret",
};

type RememberedWalletScenario = {
    connectWallet: () => void;
    productId: string;
    productName: string;
    route: string;
};

const openOrderPaymentPage = (scenario: RememberedWalletScenario) => {
    scenario.connectWallet();
    mountAuthenticatedCartRoute(scenario.route, [MAIN_SERVER_URL], cartSecrets);
    waitForDetailQuery(
        MAIN_SERVER_URL,
        "ProductById",
        { id: scenario.productId },
        "Product",
        scenario.productId,
        scenario.productName,
    );
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
    screenshotStep(`remembered-wallet-product-${scenario.productId}`);
    addToCart();

    cy.routerNavigate("/cart");
    cy.contains("Proceed to order").click();
    cy.contains("h2", "Order").should("be.visible");
    fillFormField("Email", "remembered-wallet@example.test");
    fillFormField("First name", "Wallet");
    fillFormField("Last name", "Remembered");
    fillFormField("Address line 1", "10 Harbor Way");
    fillFormField("City", "Port Sol");
    fillFormField("Postal code", "11111");
    fillFormField("Country", "Liberland");
    cy.contains("button", "Create order").click();
    cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
    screenshotStep(`remembered-wallet-order-${scenario.productId}`);
};

describe("remembered wallet shortcut", () => {
    it("skips connect when the saved solana wallet is already connected", () => {
        openOrderPaymentPage({
            connectWallet: () => connectSolanaWalletStub("SoUserWallet1717", "phantom"),
            productId: "product-solar-widget",
            productName: "Solar Widget",
            route: "/products-services/product-solar-widget",
        });

        cy.contains(".ant-card", "1st payment").within(() => {
            cy.contains("Solana (SOL)").parents(".ant-list-item").first().within(() => {
                cy.contains("button", "Connect").should("not.exist");
            cy.contains("button", "Pay").should("be.visible").click();
            cy.contains("Payment submitted").should("be.visible");
        });
        screenshotStep("remembered-wallet-saved-solana");
    });
    });

    it("skips connect when the saved thirdweb wallet is already connected", () => {
        openOrderPaymentPage({
            connectWallet: () => connectThirdwebWalletStub("0xUserWallet1818", "metamask"),
            productId: "product-harbor-lantern",
            productName: "Harbor Lantern",
            route: "/products-services/product-harbor-lantern",
        });

        cy.contains(".ant-card", "1st payment").within(() => {
            cy.contains("Ethereum (ETH)").parents(".ant-list-item").first().within(() => {
                cy.contains("button", "Connect").should("not.exist");
            cy.contains("button", "Pay").should("be.visible").click();
            cy.contains("Payment submitted").should("be.visible");
        });
        screenshotStep("remembered-wallet-saved-ethereum");
    });
    });

    it("skips connect when the saved tron wallet is already connected", () => {
        openOrderPaymentPage({
            connectWallet: () => connectTronWalletStub("TUserWallet1919", "TronLink Stub"),
            productId: "product-shore-kit",
            productName: "Shore Kit",
            route: "/products-services/product-shore-kit",
        });

        cy.contains(".ant-card", "1st payment").within(() => {
            cy.contains("Tron (TRX)").parents(".ant-list-item").first().within(() => {
                cy.contains("button", "Connect").should("not.exist");
            cy.contains("button", "Pay").should("be.visible").click();
            cy.contains("Payment submitted").should("be.visible");
        });
        screenshotStep("remembered-wallet-saved-tron");
    });
});
});
