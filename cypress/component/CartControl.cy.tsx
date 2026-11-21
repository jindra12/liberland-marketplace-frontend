import React from "react";
import { Flex } from "antd";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders } from "../support/component-tests/direct";
import { AddToCartButton } from "../../src/components/cart/AddToCartButton";
import { CART_SECRETS_INDEX_KEY } from "../../src/components/cart/cartSecrets";

const mountCartControl = (clearStorage = true) => {
    mountWithProviders(
        <AddToCartButton
            productId="product-harbor-lantern"
            serverURL={MAIN_SERVER_URL}
            me={[]}
            hideBuyNowButton
        />,
        {
            route: "/cart-control",
            clearStorage,
        },
    );
};

const getCartQuantityControl = () => cy.get(".AddToCartButton__quantity");

const addProductToCart = () => {
    cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible").click();
    cy.wait(["@createCart", "@readCart"]);
    getCartQuantityControl().find("input").should("not.be.disabled").and("have.value", "1");
};

describe("cart control", () => {
    beforeEach(() => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            const query: string = req.body.query || "";
            if (query.includes("query CartBySecret(")) {
                expect(req.headers["x-cart-secret"]).to.equal(req.body.variables.secret);
                req.alias = "readCart";
            } else if (query.includes("mutation UpdateCart(")) {
                expect(req.headers["x-cart-secret"]).to.be.a("string").and.not.equal("");
                req.alias = "updateCart";
            } else {
                expect(req.headers["x-cart-secret"]).to.equal(undefined);
                if (query.includes("mutation CreateCart(")) {
                    req.alias = "createCart";
                }
            }
        });
    });

    it("persists arrow changes across a remount", () => {
        mountCartControl();

        addProductToCart();
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-up").click({ force: true });
        cy.wait("@updateCart");
        getCartQuantityControl().find("input").should("have.value", "2");

        mountCartControl(false);
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "2");
    });

    it("removes the item when the quantity reaches zero", () => {
        mountCartControl();

        addProductToCart();
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-down").click({ force: true });
        cy.wait("@updateCart");
        cy.get(".AddToCartButton__quantity").should("not.exist");
    });

    it("does not keep negative values in the quantity field", () => {
        mountCartControl();

        addProductToCart();
        getCartQuantityControl().find("input").type("-", { force: true }).blur();
        getCartQuantityControl().find("input").should("have.value", "1");
    });

    it("waits until blur before persisting typed quantities", () => {
        mountCartControl();

        addProductToCart();
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find("input").clear({ force: true }).type("5", { force: true });
        getCartQuantityControl().find("input").should("have.value", "5");
        getCartQuantityControl().find("input").blur();
        cy.wait("@updateCart");

        mountCartControl(false);
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "5");
    });

    it("keeps cart capabilities scoped to each syndicated backend", () => {
        cy.intercept("POST", "**/api/graphql", (req) => {
            if (!req.body.query?.includes("query CartBySecret(")) {
                return;
            }
            const main = req.url === `${MAIN_SERVER_URL}/api/graphql`;
            expect(req.headers["x-cart-secret"]).to.equal(main ? "alpha-secret" : "coop-secret");
            req.alias = main ? "mainCartCapability" : "coopCartCapability";
        });
        mountWithProviders(
            <Flex vertical gap={16}>
                <AddToCartButton productId="product-harbor-lantern" serverURL={MAIN_SERVER_URL} me={[]} hideBuyNowButton />
                <AddToCartButton productId="product-coop-toolkit" serverURL={COOP_SERVER_URL} me={[]} hideBuyNowButton />
            </Flex>,
            {
                route: "/cart-control",
                setup: (win) => win.localStorage.setItem(CART_SECRETS_INDEX_KEY, JSON.stringify([
                    { url: MAIN_SERVER_URL, secret: "alpha-secret" },
                    { url: COOP_SERVER_URL, secret: "coop-secret" },
                ])),
            },
        );
        cy.wait(["@mainCartCapability", "@coopCartCapability"]);
        cy.get(".AddToCartButton__compact").first().screenshot("cart-capability-control");
    });
});
