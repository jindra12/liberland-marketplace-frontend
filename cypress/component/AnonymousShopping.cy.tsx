import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    fillFormField,
    mountAnonymousRoute,
    waitForDetailQuery,
} from "../support/component-tests/utils";

const anonymousCartSecrets = {
    [MAIN_SERVER_URL]: "anon-shopping-main-secret",
    [COOP_SERVER_URL]: "anon-shopping-coop-secret",
};

const fillOrderAddress = () => {
    fillFormField("Email", "anonymous-shopper@example.test");
    fillFormField("First name", "Anon");
    fillFormField("Last name", "Buyer");
    fillFormField("Address line 1", "100 Market Street");
    fillFormField("City", "Harbor City");
    fillFormField("Postal code", "99999");
    fillFormField("Country", "Liberland");
};

const openProduct = (serverUrl: string, route: string, id: string, title: string) => {
    mountAnonymousRoute(route, [serverUrl], anonymousCartSecrets);
    waitForDetailQuery(serverUrl, "ProductById", { id }, "Product", id, title);
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
    cy.screenshot(`anonymous-shopping-${id}-detail`, {
        capture: "fullPage",
    });
};

describe("anonymous shopping", () => {
    it("builds mixed server carts and shows the expected chain payment split", () => {
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

        openProduct(
            COOP_SERVER_URL,
            "/products-services/coop-product-tide-lamp",
            "coop-product-tide-lamp",
            "Tide Lamp",
        );

        mountAnonymousRoute("/cart", [MAIN_SERVER_URL, COOP_SERVER_URL], anonymousCartSecrets);
        cy.contains("Proceed to order").click();
        cy.contains("h2", "Order").should("be.visible");
        cy.screenshot("anonymous-shopping-order-form", {
            capture: "fullPage",
        });
        fillOrderAddress();
        cy.screenshot("anonymous-shopping-order-form-filled", {
            capture: "fullPage",
        });
        cy.contains("button", "Create order").click();
        cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
        cy.screenshot("anonymous-shopping-order-payment-page", {
            capture: "fullPage",
        });
        cy.get(".OrderPage .ant-card").should("have.length", 2);
        cy.get(".OrderPage").then(($page) => {
            const text = $page.text();
            expect((text.match(/Ethereum \(ETH\)/g) || []).length).to.equal(2);
            expect((text.match(/Tron \(TRX\)/g) || []).length).to.equal(2);
            expect((text.match(/Solana \(SOL\)/g) || []).length).to.equal(1);
            expect((text.match(/Amount due: 0\.03 ETH/g) || []).length).to.equal(1);
            expect((text.match(/Amount due: 0\.123 ETH/g) || []).length).to.equal(1);
            expect((text.match(/Amount due: 19 TRX/g) || []).length).to.equal(1);
            expect((text.match(/Amount due: 208 TRX/g) || []).length).to.equal(1);
            expect((text.match(/Amount due: 1 SOL/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: 0xHarbor111/g) || []).length).to.equal(2);
            expect((text.match(/Recipient: SoSolar111/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: TShoreKit444/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: TTide630/g) || []).length).to.equal(1);
        });
    });
});
