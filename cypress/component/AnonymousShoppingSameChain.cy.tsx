import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    addToCart,
    fillFormField,
    mountAnonymousRoute,
    waitForDetailQuery,
} from "../support/component-tests/utils";

const buildAnonymousCartSecrets = (suffix: string) => {
    return {
        [MAIN_SERVER_URL]: `anon-shopping-main-secret-same-chain-${suffix}`,
    };
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

const openProduct = (route: string, id: string, title: string, cartSecrets: Record<string, string>) => {
    mountAnonymousRoute(route, [MAIN_SERVER_URL], cartSecrets, (win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
    waitForDetailQuery(MAIN_SERVER_URL, "ProductById", { id }, "Product", id, title);
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
};

describe("anonymous shopping same-chain", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
    });

    it("splits same-chain payments by recipient", () => {
        const cartSecrets = buildAnonymousCartSecrets(`${Date.now()}`);

        openProduct(
            detailRoute("/products-services", "product-river-beacon"),
            "product-river-beacon",
            "River Beacon",
            cartSecrets,
        );
        addToCart();

        cy.routerNavigate(detailRoute("/products-services", "product-moon-lamp"));
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-moon-lamp" },
            "Product",
            "product-moon-lamp",
            "Moon Lamp",
        );
        cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
        addToCart();

        mountAnonymousRoute("/cart", [MAIN_SERVER_URL], cartSecrets, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        cy.contains("Proceed to order").click();
        cy.contains("h2", "Order").should("be.visible");
        fillOrderAddress();
        cy.contains("button", "Create order").click();
        cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");

        cy.get(".OrderPage .ant-card").should("have.length", 1);
        cy.get(".OrderPage").then(($page) => {
            const text = $page.text();
            expect((text.match(/Ethereum \(ETH\)/g) || []).length).to.equal(2);
            expect((text.match(/Recipient: 0xRiverBeacon333/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: 0xMoonLamp555/g) || []).length).to.equal(1);
        });
    });
});
