import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";
import { detailRoute, COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    addToCart,
    dismissNsfwModal,
    fillFormField,
    mountAnonymousRoute,
    waitForDetailQuery,
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
    waitForDetailQuery(serverUrl, "ProductById", { id }, "Product", id, title);
    cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
    dismissNsfwModal();
};

describe("anonymous shopping mobile", () => {
    beforeEach(() => {
        cy.clearLocalStorage();
        resetGraphQLMock();
        getGraphQLFixturesForHost(MAIN_SERVER_URL).carts.length = 0;
        getGraphQLFixturesForHost(COOP_SERVER_URL).carts.length = 0;
        cy.viewport(390, 844);
    });

    it("builds mixed server carts and shows the expected chain payment split", () => {
        const cartSecrets = buildAnonymousCartSecrets(`mixed-mobile-${Date.now()}`);

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
        fillOrderAddress();
        cy.contains("button", "Create order").click();
        cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
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
    });

    it("splits same-chain payments by recipient on mobile", () => {
        const cartSecrets = buildAnonymousCartSecrets(`same-chain-mobile-${Date.now()}`);

        mountAnonymousRoute(
            detailRoute("/products-services", "product-river-beacon"),
            [MAIN_SERVER_URL],
            cartSecrets,
            (win) => {
                win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
            },
        );
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-river-beacon" },
            "Product",
            "product-river-beacon",
            "River Beacon",
        );
        cy.get(".ProductDetail", { timeout: 20000 }).should("be.visible");
        dismissNsfwModal();
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
        dismissNsfwModal();
        addToCart();

        mountAnonymousRoute("/cart", [MAIN_SERVER_URL], cartSecrets, (win) => {
            win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
        });
        cy.contains("Proceed to order").click();
        cy.contains("h2", "Order").should("be.visible");
        fillOrderAddress();
        cy.contains("button", "Create order").click();
        cy.contains(".OrderPage", "Orders submitted. Pay each order using the chain amount below.").should("be.visible");
        cy.get(".OrderPage").then(($page) => {
            const text = $page.text();
            expect((text.match(/Ethereum \(ETH\)/g) || []).length).to.equal(3);
            expect((text.match(/Recipient: 0xHarbor111/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: 0xRiverBeacon333/g) || []).length).to.equal(1);
            expect((text.match(/Recipient: 0xMoonLamp555/g) || []).length).to.equal(1);
        });
    });
});
