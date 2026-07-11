import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { detailRoute, COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    addToCart,
    dismissNsfwModal,
    fillFormField,
    mountAnonymousRoute,
    screenshotDetailStep,
    screenshotStep,
} from "../support/component-tests/utils";
import { getGraphQLFixturesForHost, resetGraphQLMock } from "../support/graphqlMock/runtimeState";

const buildAnonymousCartSecrets = (suffix: string) => {
    return {
        [MAIN_SERVER_URL]: `anon-shopping-main-secret-${suffix}`,
        [COOP_SERVER_URL]: `anon-shopping-coop-secret-${suffix}`,
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

const openProduct = (serverUrl: string, route: string, id: string, title: string, cartSecrets: Record<string, string>) => {
    mountAnonymousRoute(route, [serverUrl], cartSecrets, (win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
    cy.contains(".EntityDetail__title", title, { timeout: 20000 }).should("be.visible");
    dismissNsfwModal();
    screenshotDetailStep(`anonymous-shopping-${id}-detail`);
};

const runAnonymousShoppingFlow = (suffix: string) => {
    cy.clearLocalStorage();
    resetGraphQLMock();
    getGraphQLFixturesForHost(MAIN_SERVER_URL).carts.length = 0;
    getGraphQLFixturesForHost(COOP_SERVER_URL).carts.length = 0;
    cy.viewport(1280, 1200);

    const cartSecrets = buildAnonymousCartSecrets(suffix);

    openProduct(
        MAIN_SERVER_URL,
        detailRoute("/products-services", "product-harbor-lantern"),
        "product-harbor-lantern",
        "Harbor Lantern",
        cartSecrets,
    );
    openProduct(
        MAIN_SERVER_URL,
        detailRoute("/products-services", "product-solar-widget"),
        "product-solar-widget",
        "Solar Widget",
        cartSecrets,
    );
    openProduct(
        MAIN_SERVER_URL,
        detailRoute("/products-services", "product-solar-rig"),
        "product-solar-rig",
        "Solar Rig",
        cartSecrets,
    );
    openProduct(
        MAIN_SERVER_URL,
        detailRoute("/products-services", "product-shore-kit"),
        "product-shore-kit",
        "Shore Kit",
        cartSecrets,
    );

    openProduct(
        COOP_SERVER_URL,
        detailRoute("/products-services", "coop-product-harbor-ether-lantern", COOP_SERVER_URL),
        "coop-product-harbor-ether-lantern",
        "Harbor Ether Lantern",
        cartSecrets,
    );

    openProduct(
        COOP_SERVER_URL,
        detailRoute("/products-services", "coop-product-tide-lamp", COOP_SERVER_URL),
        "coop-product-tide-lamp",
        "Tide Lamp",
        cartSecrets,
    );

    mountAnonymousRoute("/cart", [MAIN_SERVER_URL, COOP_SERVER_URL], cartSecrets);
    cy.contains("Proceed to order").click();
    cy.contains("h2", "Order").should("be.visible");
    screenshotStep(`anonymous-shopping-order-form-${suffix}`);
    fillOrderAddress();
    screenshotStep(`anonymous-shopping-order-form-filled-${suffix}`);
    cy.contains("button", "Create order").click();
    cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
    screenshotStep(`anonymous-shopping-order-payment-page-${suffix}`);
    cy.get(".OrderPage .ant-card").should("have.length", 1);
    cy.get(".OrderPage").then(($page) => {
        const text = $page.text();
        expect((text.match(/Ethereum \(ETH\)/g) || []).length).to.equal(1);
        expect((text.match(/Tron \(TRX\)/g) || []).length).to.equal(1);
        expect((text.match(/Amount due: 0\.123 ETH/g) || []).length).to.equal(1);
        expect((text.match(/Amount due: 208 TRX/g) || []).length).to.equal(1);
        expect((text.match(/Recipient: 0xHarbor111/g) || []).length).to.equal(1);
        expect((text.match(/Recipient: TTide630/g) || []).length).to.equal(1);
    });
};

describe("anonymous shopping", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        resetGraphQLMock();
        getGraphQLFixturesForHost(MAIN_SERVER_URL).carts.length = 0;
        getGraphQLFixturesForHost(COOP_SERVER_URL).carts.length = 0;
    });

    it("builds mixed server carts and shows the expected chain payment split", () => {
        const suffix = `anonymous-shopping-${Date.now()}`;
        runAnonymousShoppingFlow(`${suffix}-desktop`);
        cy.viewport(390, 844);
        cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
        screenshotStep(`${suffix}-mobile`);
    });
});
