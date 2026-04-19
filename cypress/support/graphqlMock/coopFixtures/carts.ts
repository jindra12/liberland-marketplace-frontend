import { products } from "./products";
import { meUser } from "./meUser";
import { Cart_Currency, Cart_Status } from "../../../../src/generated/graphql";
import type { Cart } from "../../../../src/generated/graphql";

export const carts: Cart[] = [
    {
        id: "coop-cart-alpha",
        secret: "coop-alpha-secret",
        status: Cart_Status.Active,
        currency: Cart_Currency.Usd,
        subtotal: 213,
        createdAt: "2025-03-01T09:00:00.000Z",
        updatedAt: "2025-03-01T10:00:00.000Z",
        purchasedAt: null,
        customer: meUser.user,
        items: [
            { id: "coop-cart-alpha-item-1", quantity: 3, product: products[2] },
            { id: "coop-cart-alpha-item-2", quantity: 1, product: products[1] },
        ],
    },
    {
        id: "coop-cart-anon-shopping",
        secret: "anon-shopping-coop-secret",
        status: Cart_Status.Active,
        currency: Cart_Currency.Usd,
        subtotal: 213,
        createdAt: "2025-04-01T09:00:00.000Z",
        updatedAt: "2025-04-01T09:00:00.000Z",
        purchasedAt: null,
        customer: null,
        items: [
            { id: "coop-cart-anon-shopping-item-1", quantity: 3, product: products[2] },
            { id: "coop-cart-anon-shopping-item-2", quantity: 1, product: products[1] },
        ],
    },
];
