import { identities } from "./identities";
import { products } from "./products";
import type { Transaction, User } from "../../../../src/generated/graphql";
import { Order_Currency, Order_Status, Order_CryptoPrices_Chain, Transaction_Currency, Transaction_Status } from "../../../../src/generated/graphql";

import type { MockNode } from "../types";

const customer: User = {
    id: identities[1].id,
    name: identities[1].name,
    email: identities[1].id === "coop-identity-luca" ? "luca@example.test" : "customer@example.test",
    emailVerified: true,
    phone: "+1 555 0607",
    shippingAddress: null,
    wallets: [],
};

const transaction: Transaction = {
    id: "coop-tx-1",
    status: Transaction_Status.Succeeded,
    customer,
    customerEmail: customer.email,
    amount: 164,
    currency: Transaction_Currency.Usd,
    createdAt: "2025-03-10T12:00:00.000Z",
    updatedAt: "2025-03-10T12:05:00.000Z",
    items: [
        {
            id: "coop-tx-item-1",
            quantity: 2,
            product: products[0],
        },
    ],
};

export const orders: MockNode[] = [
    {
        id: "coop-order-alpha",
        status: Order_Status.Completed,
        payerAddress: "SoCoopOrder1717",
        customer,
        transactions: [transaction],
        cryptoPrices: [
            {
                id: "coop-crypto-price-1",
                chain: Order_CryptoPrices_Chain.Solana,
                stablePerNative: 25,
                nativePerStable: "0.04",
                expectedNativeAmount: "3.200000000",
                fetchedAt: "2025-03-10T12:00:00.000Z",
            },
        ],
        transactionHashes: [
            {
                id: "coop-hash-1",
                chain: "solana",
                transactionHash: "coop-solana-tx-1",
                product: products[0],
            },
        ],
        currency: Order_Currency.Usd,
        amount: 164,
        customerEmail: customer.email,
        createdAt: "2025-03-10T12:00:00.000Z",
        updatedAt: "2025-03-10T12:05:00.000Z",
        items: [
            {
                id: "coop-order-item-1",
                quantity: 2,
                product: products[0],
            },
        ],
        shippingAddress: {
            title: "Depot",
            firstName: "Luca",
            lastName: "Vale",
            company: "Helix Harbor",
            addressLine1: "18 Bridge Road",
            addressLine2: "",
            city: "North Port",
            postalCode: "22000",
            state: "Coast",
            country: "Liberland",
            phone: "+1 555 0606",
        },
    },
];
