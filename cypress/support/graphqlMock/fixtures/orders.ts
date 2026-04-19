import { identities } from "./identities";
import { companies } from "./companies";
import { products } from "./catalog";
import type { Order } from "../../../../src/generated/graphql";

export const orders: Order[] = [
    {
        id: "order-alpha",
        status: "awaiting-payment",
        payerAddress: "SoOrderAlpha1515",
        customer: { id: identities[2].id },
        transactions: [{ id: "tx-alpha-1" }, { id: "tx-alpha-2" }],
        cryptoPrices: [
            {
                id: "crypto-price-1",
                chain: "solana",
                stablePerNative: 19,
                nativePerStable: 0.0526315,
                expectedNativeAmount: "4.250000000",
                fetchedAt: "2025-02-10T12:00:00.000Z",
            },
        ],
        transactionHashes: [
            {
                id: "hash-alpha-1",
                chain: "solana",
                transactionHash: "solana-tx-alpha-1",
                product: { id: products[0].id },
            },
        ],
        currency: "USD",
        amount: 267,
        customerEmail: identities[2].email,
        createdAt: "2025-02-10T12:00:00.000Z",
        updatedAt: "2025-02-10T12:05:00.000Z",
        items: [
            {
                id: "order-alpha-item-1",
                quantity: 2,
                product: {
                    id: products[0].id,
                    serverURL: products[0].serverURL,
                    name: products[0].name,
                    priceInETH: products[0].priceInETH,
                    priceInSOL: products[0].priceInSOL,
                    priceInTRX: products[0].priceInTRX,
                    cryptoAddresses: products[0].cryptoAddresses,
                    company: { id: companies[0].id, cryptoAddresses: companies[0].cryptoAddresses },
                },
                variant: { id: products[0].variants?.docs[0]?.id, title: products[0].variants?.docs[0]?.title },
            },
        ],
        shippingAddress: {
            title: "Home",
            firstName: "Mira",
            lastName: "Vale",
            company: "Nomad Collective",
            addressLine1: "1 Harbor Way",
            addressLine2: "Suite 42",
            city: "Port Sol",
            postalCode: "11000",
            state: "Coast",
            country: "Liberland",
            phone: "+1 555 0101",
        },
    },
    {
        id: "order-beta",
        status: "paid",
        payerAddress: "0xOrderBeta1616",
        customer: { id: identities[0].id },
        transactions: [{ id: "tx-beta-1" }],
        cryptoPrices: [
            {
                id: "crypto-price-2",
                chain: "ethereum",
                stablePerNative: 2050,
                nativePerStable: 0.0004878,
                expectedNativeAmount: "0.160000000",
                fetchedAt: "2025-02-11T12:00:00.000Z",
            },
        ],
        transactionHashes: [
            {
                id: "hash-beta-1",
                chain: "ethereum",
                transactionHash: "eth-tx-beta-1",
                product: { id: products[3].id },
            },
        ],
        currency: "USD",
        amount: 84,
        customerEmail: identities[0].email,
        createdAt: "2025-02-11T12:00:00.000Z",
        updatedAt: "2025-02-11T12:05:00.000Z",
        items: [
            {
                id: "order-beta-item-1",
                quantity: 4,
                product: {
                    id: products[3].id,
                    serverURL: products[3].serverURL,
                    name: products[3].name,
                    priceInETH: products[3].priceInETH,
                    priceInSOL: products[3].priceInSOL,
                    priceInTRX: products[3].priceInTRX,
                    cryptoAddresses: products[3].cryptoAddresses,
                    company: { id: companies[3].id, cryptoAddresses: companies[3].cryptoAddresses },
                },
            },
        ],
        shippingAddress: {
            title: "Office",
            firstName: "Nova",
            lastName: "Rivers",
            company: "Harbor Labs",
            addressLine1: "22 Dockside Road",
            addressLine2: "",
            city: "Harbor City",
            postalCode: "12000",
            state: "Harbor",
            country: "Liberland",
            phone: "+1 555 0202",
        },
    },
];
