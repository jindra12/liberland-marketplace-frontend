import { UserManager } from "oidc-client-ts";

import { detailRoute, COOP_SERVER_URL, GUEST_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    mountAnonymousRoute,
    mountAuthenticatedDetailRoute,
    screenshotStep,
    waitForDetailQuery,
    waitForMeUserQuery,
} from "../support/component-tests/utils";
import type { AddressWithEmail } from "../../src/components/order/types";
import { BUY_NOW_RETURN_TO_STORAGE_KEY } from "../../src/components/cart/BuyNowButton/constants";

const guestProductRoute = detailRoute("/products-services", "guest-product-harbor-light", GUEST_SERVER_URL);
const guestNonOrderableRoute = detailRoute("/products-services", "guest-product-harbor-brochure", GUEST_SERVER_URL);
const mainProductRoute = detailRoute("/products-services", "product-harbor-lantern");

const mainSavedShippingAddress: AddressWithEmail = {
    id: "saved-main-shipping-address",
    email: "nova@example.test",
    title: "Home",
    firstName: "Nova",
    lastName: "Rivers",
    company: "Harbor Labs",
    addressLine1: "1 Dockside Road",
    addressLine2: "Apt 12",
    city: "Port Sol",
    state: "Coast",
    postalCode: "11001",
    country: "Liberland",
    phone: "+1 555 0002",
};

const openBuyNow = () => {
    cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
};

describe("buy now", () => {
    it("shows Buy now to anonymous users and redirects them to login", () => {
        const signinRedirect = cy.stub(UserManager.prototype, "signinRedirect").resolves();
        let signinRedirectArgs: Parameters<UserManager["signinRedirect"]>[0];

        mountAnonymousRoute(guestProductRoute, [GUEST_SERVER_URL]);
        waitForDetailQuery(
            GUEST_SERVER_URL,
            "ProductById",
            { id: "guest-product-harbor-light" },
            "Product",
            "guest-product-harbor-light",
            "Harbor Light",
        );

        cy.contains("h1", "Harbor Light").should("be.visible");
        cy.get(".AddToCartButton__buyNow").should("be.visible");

        cy.contains(".AddToCartButton__buyNow", "Buy now").click();
        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.wrap(null).should(() => {
            expect(signinRedirect).to.have.been.calledOnce;
            signinRedirectArgs = signinRedirect.getCall(0)?.args[0];
            expect(signinRedirectArgs?.state).to.equal(guestProductRoute);
            expect(JSON.parse(window.sessionStorage.getItem(BUY_NOW_RETURN_TO_STORAGE_KEY) || '""')).to.equal(
                guestProductRoute,
            );
        });
    });

    it("returns to the current page and reopens buy now after login refresh", () => {
        const signinRedirect = cy.stub(UserManager.prototype, "signinRedirect").resolves();

        mountAnonymousRoute(mainProductRoute, [MAIN_SERVER_URL]);
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-harbor-lantern" },
            "Product",
            "product-harbor-lantern",
            "Harbor Lantern",
        );

        cy.contains("h1", "Harbor Lantern").should("be.visible");
        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();

        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.wrap(null).should(() => {
            expect(signinRedirect.getCall(0)?.args[0]?.state).to.equal(mainProductRoute);
            expect(JSON.parse(window.sessionStorage.getItem(BUY_NOW_RETURN_TO_STORAGE_KEY) || '""')).to.equal(
                mainProductRoute,
            );
        });

        mountAuthenticatedDetailRoute(mainProductRoute, [MAIN_SERVER_URL], mainSavedShippingAddress, true);
        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-harbor-lantern" },
            "Product",
            "product-harbor-lantern",
            "Harbor Lantern",
        );

        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        cy.window().then((win) => {
            expect(JSON.parse(win.sessionStorage.getItem(BUY_NOW_RETURN_TO_STORAGE_KEY) || '""')).to.equal("");
        });
    });

    it("does not show Buy now on non-orderable products", () => {
        mountAuthenticatedDetailRoute(guestNonOrderableRoute, [GUEST_SERVER_URL]);
        waitForDetailQuery(
            GUEST_SERVER_URL,
            "ProductById",
            { id: "guest-product-harbor-brochure" },
            "Product",
            "guest-product-harbor-brochure",
            "Harbor Brochure",
        );

        cy.contains("h1", "Harbor Brochure").should("be.visible");
        cy.get(".AddToCartButton__buyNow").should("not.exist");
    });

    it("tells users without a saved shipping address to go to profile", () => {
        mountAuthenticatedDetailRoute(guestProductRoute, [GUEST_SERVER_URL]);
        waitForMeUserQuery(GUEST_SERVER_URL, "Mira Harbor", {});

        openBuyNow();

        cy.contains(".BuyNowCreateOrderStep", "No default shipping addresses found").should("be.visible");
        screenshotStep("buy-now-no-default-shipping-addresses");
        cy.contains(".BuyNowCreateOrderStep .ant-modal-footer .ant-btn", "Go to profile")
            .should("be.visible")
            .click({ force: true });
        cy.location("pathname").should("eq", "/profile");
        cy.contains("h2", "My Profile").should("be.visible");
    });

    it("lets users pick an address and remembers it", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (typeof req.body.query === "string" && req.body.query.includes("CreateOrder")) {
                req.alias = "createOrder";
            }
        });
        mountAuthenticatedDetailRoute(mainProductRoute, [MAIN_SERVER_URL, COOP_SERVER_URL], undefined, true);
        waitForMeUserQuery(MAIN_SERVER_URL, "Nova Rivers", {});
        waitForMeUserQuery(COOP_SERVER_URL, "Iris Shore", {});

        openBuyNow();

        cy.contains(".ShippingAddressSelectModal", "Choose a default shipping address").should("be.visible");
        screenshotStep("buy-now-shipping-address-picker");
        cy.contains(".ShippingAddressSelectModal__option", "Nova Rivers").should("be.visible");
        cy.contains(".ShippingAddressSelectModal__option", "Iris Shore")
            .should("be.visible")
            .find(".ant-radio-input")
            .check({ force: true });

        cy.wait("@createOrder");
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        screenshotStep("buy-now-payment-modal-after-address-choice");
        cy.get(".BuyNowPaymentModal .ant-modal-close").click();
        cy.contains(".AddToCartButton__buyNow", "Buy now").should("be.visible").click();
        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        cy.get(".ShippingAddressSelectModal").should("not.exist");
    });

    it("uses a saved shipping address to reach the payment modal immediately", () => {
        mountAuthenticatedDetailRoute(mainProductRoute, [MAIN_SERVER_URL], mainSavedShippingAddress, true);

        openBuyNow();

        cy.contains(".BuyNowPaymentModal", "Complete payment").should("be.visible");
        screenshotStep("buy-now-saved-shipping-address-payment-modal");
        cy.get(".ShippingAddressSelectModal").should("not.exist");
    });

    it("keeps the buy-now purchase control compact on the product detail page", () => {
        cy.viewport(1200, 1200);
        mountAuthenticatedDetailRoute(mainProductRoute, [MAIN_SERVER_URL], mainSavedShippingAddress);

        cy.get(".ProductDetail__purchaseControl .AddToCartButton__compact")
            .should("be.visible");

        cy.get(".ProductDetail__purchaseControl .AddToCartButton__compact")
            .then(($purchaseControl) => $purchaseControl[0].getBoundingClientRect().width)
            .then((purchaseControlWidth) => {
                cy.get(".ProductDetail__purchaseControl")
                    .then(($purchaseSection) => $purchaseSection[0].getBoundingClientRect().width)
                    .then((purchaseSectionWidth) => {
                        expect(purchaseControlWidth).to.be.lessThan(purchaseSectionWidth);
                    });
            });

        screenshotStep("buy-now-compact-purchase-control");
    });

    it("shows a secondary Add to cart button before the product is in cart and turns it into quantity control after click", () => {
        cy.viewport(1200, 1200);
        mountAuthenticatedDetailRoute(mainProductRoute, [MAIN_SERVER_URL], mainSavedShippingAddress, true);

        waitForDetailQuery(
            MAIN_SERVER_URL,
            "ProductById",
            { id: "product-harbor-lantern" },
            "Product",
            "product-harbor-lantern",
            "Harbor Lantern",
        );

        cy.contains(".ProductDetail__purchaseControl .AddToCartButton__submit", "Add to cart")
            .should("be.visible")
            .and("have.class", "ant-btn-default")
            .and("not.have.class", "ant-btn-primary");

        cy.contains(".ProductDetail__purchaseControl .AddToCartButton__submit", "Add to cart").click();
        cy.get(".ProductDetail__purchaseControl .AddToCartButton__quantity input")
            .should("be.visible")
            .and("have.value", "1");

        screenshotStep("buy-now-add-to-cart-switches-to-quantity-control");
    });
});
