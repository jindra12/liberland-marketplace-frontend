import { products } from "./catalog";
import { meUser } from "./meUser";
import { Cart_Currency, Cart_Status } from "../../../../src/generated/graphql";
import type { Cart } from "../../../../src/generated/graphql";

export const carts: Cart[] = [
    {
        id: "cart-alpha",
        secret: "alpha-secret",
        status: Cart_Status.Active,
        currency: Cart_Currency.Usd,
        subtotal: 115,
        createdAt: "2025-02-01T09:00:00.000Z",
        updatedAt: "2025-02-01T10:00:00.000Z",
        purchasedAt: null,
        customer: meUser.user!,
        items: [
            { id: "cart-alpha-item-1", quantity: 1, product: products[4], parameters: [] },
            { id: "cart-alpha-item-2", quantity: 1, product: products[0], variant: products[0].variants?.docs[0], parameters: [] },
            { id: "cart-alpha-item-3", quantity: 1, product: products[5], parameters: [] },
            { id: "cart-alpha-item-4", quantity: 1, product: products[3], parameters: [] },
        ],
    },
    {
        id: "cart-beta",
        secret: "beta-secret",
        status: Cart_Status.Purchased,
        currency: Cart_Currency.Usd,
        subtotal: 267,
        createdAt: "2025-02-02T09:00:00.000Z",
        updatedAt: "2025-02-02T10:00:00.000Z",
        purchasedAt: "2025-02-03T09:00:00.000Z",
        customer: meUser.user!,
        items: [
            { id: "cart-beta-item-1", quantity: 1, product: products[2], variant: products[2].variants?.docs[0], parameters: [] },
            { id: "cart-beta-item-2", quantity: 4, product: products[3], parameters: [] },
        ],
    },
    {
        id: "cart-anon-shopping-main",
        secret: "anon-shopping-main-secret",
        status: Cart_Status.Active,
        currency: Cart_Currency.Usd,
        subtotal: 115,
        createdAt: "2025-04-01T09:00:00.000Z",
        updatedAt: "2025-04-01T09:00:00.000Z",
        purchasedAt: null,
        customer: null,
        items: [
            { id: "cart-anon-shopping-main-item-1", quantity: 1, product: products[4], parameters: [] },
            { id: "cart-anon-shopping-main-item-2", quantity: 1, product: products[0], parameters: [] },
            { id: "cart-anon-shopping-main-item-3", quantity: 1, product: products[5], parameters: [] },
            { id: "cart-anon-shopping-main-item-4", quantity: 1, product: products[3], parameters: [] },
        ],
    },
];
