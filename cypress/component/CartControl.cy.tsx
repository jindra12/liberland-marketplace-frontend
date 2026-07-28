import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders } from "../support/component-tests/direct";
import { AddToCartButton } from "../../src/components/cart/AddToCartButton";

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

describe("cart control", () => {
    it("persists arrow changes across a remount", () => {
        mountCartControl();

        cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible").click();
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-up").click({ force: true });
        getCartQuantityControl().find("input").should("have.value", "2");

        mountCartControl(false);
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "2");
    });

    it("removes the item when the quantity reaches zero", () => {
        mountCartControl();

        cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible").click();
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find(".ant-input-number-handler-down").click({ force: true });
        cy.get(".AddToCartButton__quantity").should("not.exist");
    });

    it("does not keep negative values in the quantity field", () => {
        mountCartControl();

        cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible").click();
        getCartQuantityControl().find("input").type("-", { force: true }).blur();
        getCartQuantityControl().find("input").should("have.value", "1");
    });

    it("waits until blur before persisting typed quantities", () => {
        mountCartControl();

        cy.contains('button[aria-label="Add to cart"]', "Add to cart").should("be.visible").click();
        getCartQuantityControl().find("input").should("have.value", "1");
        getCartQuantityControl().find("input").clear({ force: true }).type("5", { force: true });
        getCartQuantityControl().find("input").should("have.value", "5");
        getCartQuantityControl().find("input").blur();

        mountCartControl(false);
        getCartQuantityControl().should("be.visible");
        getCartQuantityControl().find("input").should("have.value", "5");
    });
});
