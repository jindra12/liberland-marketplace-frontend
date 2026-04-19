import { identities } from "./identities";
import { products } from "./catalog";
import type { Cart } from "../../../../src/generated/graphql";

export const carts: Cart[] = [
    {
        id: "cart-alpha",
        secret: "alpha-secret",
        status: "pending",
        currency: "USD",
        subtotal: 115,
        createdAt: "2025-02-01T09:00:00.000Z",
        updatedAt: "2025-02-01T10:00:00.000Z",
        purchasedAt: null,
        customer: { id: identities[2].id, name: identities[2].name, email: identities[2].email },
        items: [
            { id: "cart-alpha-item-1", quantity: 1, product: products[4] },
            { id: "cart-alpha-item-2", quantity: 1, product: products[0], variant: products[0].variants?.docs[0] },
            { id: "cart-alpha-item-3", quantity: 1, product: products[5] },
            { id: "cart-alpha-item-4", quantity: 1, product: products[3] },
        ],
    },
    {
        id: "cart-beta",
        secret: "beta-secret",
        status: "ready",
        currency: "USD",
        subtotal: 267,
        createdAt: "2025-02-02T09:00:00.000Z",
        updatedAt: "2025-02-02T10:00:00.000Z",
        purchasedAt: "2025-02-03T09:00:00.000Z",
        customer: { id: identities[0].id, name: identities[0].name, email: identities[0].email },
        items: [
            { id: "cart-beta-item-1", quantity: 1, product: products[2], variant: products[2].variants?.docs[0] },
            { id: "cart-beta-item-2", quantity: 4, product: products[3] },
        ],
    },
    {
        id: "cart-anon-shopping-main",
        secret: "anon-shopping-main-secret",
        status: "pending",
        currency: "USD",
        subtotal: 115,
        createdAt: "2025-04-01T09:00:00.000Z",
        updatedAt: "2025-04-01T09:00:00.000Z",
        purchasedAt: null,
        customer: null,
        items: [
            { id: "cart-anon-shopping-main-item-1", quantity: 1, product: products[4] },
            { id: "cart-anon-shopping-main-item-2", quantity: 1, product: products[0] },
            { id: "cart-anon-shopping-main-item-3", quantity: 1, product: products[5] },
            { id: "cart-anon-shopping-main-item-4", quantity: 1, product: products[3] },
        ],
    },
];
