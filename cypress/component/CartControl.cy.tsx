import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { addToCart, mountAuthenticatedDetailRoute } from "../support/component-tests/utils";
import type { AddressWithEmail } from "../../src/components/order/types";

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

const openHarborLanternAndCreateCart = () => {
    cy.intercept("POST", "**/api/graphql", (req) => {
        const body = req.body as { operationName?: string; query?: string };

        if (body.operationName === "ProductById" || body.query?.includes("ProductById")) {
            req.alias = "productById";
        }

        if (body.operationName === "CreateCart" || body.query?.includes("CreateCart")) {
            req.alias = "createCart";
        }

        if (body.operationName === "CartBySecret" || body.query?.includes("CartBySecret")) {
            req.alias = "cartBySecret";
        }
    });
    mountAuthenticatedDetailRoute(detailRoute("/products-services", "product-harbor-lantern"), [MAIN_SERVER_URL], mainSavedShippingAddress, true);
    cy.wait("@productById").its("response.statusCode").should("eq", 200);
    cy.get(".ProductDetail").should("be.visible");
    cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible");
    addToCart();
};

const openCart = () => {
    cy.routerNavigate("/cart");
    cy.get(".CartPage .AddToCartButton__quantity").should("be.visible");
    cy.wait("@cartBySecret").its("response.statusCode").should("eq", 200);
};

const getCartQuantityControl = () => cy.get(".CartPage .AddToCartButton__quantity");

describe("cart control", () => {
    beforeEach(() => {
        openHarborLanternAndCreateCart();
        openCart();
    });

    it("persists arrow changes across a remount", () => {
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-up").click({ force: true });
        getCartQuantityControl().find("input").should("have.value", "2");

        cy.routerNavigate("/cart");
        cy.get(".CartPage .AddToCartButton__quantity").should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "2");
    });

    it("removes the item when the quantity reaches zero", () => {
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-down").click({ force: true });
        cy.get(".CartPage .AddToCartButton__quantity").should("not.exist");

        cy.routerNavigate("/cart");
        cy.get(".CartPage .AddToCartButton__quantity").should("not.exist");
    });

    it("does not keep negative values in the quantity field", () => {
        getCartQuantityControl().find("input").type("-", { force: true }).blur();
        getCartQuantityControl().find("input").should("have.value", "1");
    });

    it("waits until blur before persisting typed quantities", () => {
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find("input").clear({ force: true }).type("5", { force: true });
        getCartQuantityControl().find("input").should("have.value", "5");
        getCartQuantityControl().find("input").blur();

        cy.routerNavigate("/cart");
        cy.get(".CartPage .AddToCartButton__quantity").should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "5");
    });
});
