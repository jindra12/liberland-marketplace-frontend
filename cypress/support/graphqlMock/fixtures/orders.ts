import { products } from "./catalog";
import { meUser } from "./meUser";
import { Order_CryptoPrices_Chain, Order_Currency, Order_Status, Transaction_Status } from "../../../../src/generated/graphql";
import type { MockNode } from "../types";

export const orders: MockNode[] = [
    {
        id: "order-alpha",
        status: Order_Status.Processing,
        payerAddress: "SoOrderAlpha1515",
        customer: meUser.user!,
        transactions: [{ id: "tx-alpha-1", status: Transaction_Status.Pending }, { id: "tx-alpha-2", status: Transaction_Status.Pending }],
        cryptoPrices: [
            {
                id: "crypto-price-1",
                chain: Order_CryptoPrices_Chain.Solana,
                stablePerNative: 19,
                nativePerStable: "0.0526315",
                expectedNativeAmount: "4.250000000",
                fetchedAt: "2025-02-10T12:00:00.000Z",
            },
        ],
        transactionHashes: [
            {
                id: "hash-alpha-1",
                chain: "solana",
                transactionHash: "solana-tx-alpha-1",
                product: products[0],
            },
        ],
        currency: Order_Currency.Usd,
        amount: 267,
        customerEmail: meUser.user!.email,
        createdAt: "2025-02-10T12:00:00.000Z",
        updatedAt: "2025-02-10T12:05:00.000Z",
        items: [
            {
                id: "order-alpha-item-1",
                quantity: 2,
                product: products[0],
                variant: products[0].variants?.docs[0]!,
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
        status: Order_Status.Completed,
        payerAddress: "0xOrderBeta1616",
        customer: meUser.user!,
        transactions: [{ id: "tx-beta-1", status: Transaction_Status.Succeeded }],
        cryptoPrices: [
            {
                id: "crypto-price-2",
                chain: Order_CryptoPrices_Chain.Ethereum,
                stablePerNative: 2050,
                nativePerStable: "0.0004878",
                expectedNativeAmount: "0.160000000",
                fetchedAt: "2025-02-11T12:00:00.000Z",
            },
        ],
        transactionHashes: [
            {
                id: "hash-beta-1",
                chain: "ethereum",
                transactionHash: "eth-tx-beta-1",
                product: products[3],
            },
        ],
        currency: Order_Currency.Usd,
        amount: 84,
        customerEmail: meUser.user!.email,
        createdAt: "2025-02-11T12:00:00.000Z",
        updatedAt: "2025-02-11T12:05:00.000Z",
        items: [
            {
                id: "order-beta-item-1",
                quantity: 4,
                product: products[3],
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
