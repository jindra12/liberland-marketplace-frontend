import type { GraphqlOperationResult, GraphqlVariables, JsonValue, MockCart, MockOrder, MockScenarioState, MockShippingAddress, MockUser } from "../types";
import { allocateId, ensureEntityExists, findRecord, getActiveUser, toArray } from "./shared";
import { buildCartItems, buildOrderCryptoPrices, buildOrderItems, computeCartSubtotal, normalizeTransactionHashes, reserveInventory, toCart, toOrder } from "./commerce";

type CartItemInput = {
    id?: JsonValue;
    product?: JsonValue;
    quantity?: JsonValue;
    variant?: JsonValue;
};

type TransactionHashInput = {
    chain?: JsonValue;
    id?: JsonValue;
    product?: JsonValue;
    transactionHash?: JsonValue;
};

type CommerceMutationVariables = GraphqlVariables & {
    data?: {
        currency?: string | null;
        customerEmail?: string | null;
        items?: CartItemInput[];
        payerAddress?: string | null;
        shippingAddress?: JsonValue;
        status?: string | null;
        transactionHashes?: TransactionHashInput[];
        wallets?: Array<{
            address?: string | null;
            chain?: string | null;
            provider?: string | null;
        }>;
        email?: string | null;
        name?: string | null;
        phone?: string | null;
    };
    draft?: boolean;
    id?: JsonValue;
    orderId?: JsonValue;
};

const toShippingAddress = (value: JsonValue | undefined): MockShippingAddress | null => {
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        return value as MockShippingAddress;
    }

    return null;
};

export const handleCommerceMutations = (
    state: MockScenarioState,
    operationName: string,
    variables: GraphqlVariables,
): GraphqlOperationResult | null => {
    const request = variables as CommerceMutationVariables;

    if (operationName === "CreateCart") {
        const items = buildCartItems(state, request.data?.items);
        const activeUser = getActiveUser(state);
        const now = new Date().toISOString();
        const cart: MockCart = {
            id: allocateId(state, "cart", "cart"),
            secret: `cart-secret-${Date.now()}`,
            status: "active",
            currency: request.data?.currency ?? "USD",
            subtotal: computeCartSubtotal(state, items),
            createdAt: now,
            updatedAt: now,
            purchasedAt: null,
            customer: activeUser?.id ?? null,
            items,
        };
        state.carts = [...toArray(state.carts), cart];

        return {
            data: {
                createCart: toCart(state, cart),
            },
        };
    }

    if (operationName === "UpdateCart") {
        const existingCart = findRecord<MockCart>(state, "carts", String(request.id));
        const notFound = ensureEntityExists(existingCart, "updateCart");

        if (notFound) {
            return notFound;
        }
        if (!existingCart) {
            return notFound;
        }

        const items =
            request.data?.items !== undefined ? buildCartItems(state, request.data.items) : toArray(existingCart.items);
        const nextCart: MockCart = {
            ...existingCart,
            currency: request.data?.currency ?? existingCart.currency ?? "USD",
            items,
            subtotal: computeCartSubtotal(state, items),
            updatedAt: new Date().toISOString(),
        };

        state.carts = toArray(state.carts).map((cart) => {
            return cart.id === existingCart.id ? nextCart : cart;
        });

        return {
            data: {
                updateCart: toCart(state, nextCart),
            },
        };
    }

    if (operationName === "DeleteCart") {
        const existingCart = findRecord<MockCart>(state, "carts", String(request.id));
        const notFound = ensureEntityExists(existingCart, "deleteCart");

        if (notFound) {
            return notFound;
        }
        if (!existingCart) {
            return notFound;
        }

        state.carts = toArray(state.carts).filter((cart) => cart.id !== String(request.id));

        return {
            data: {
                deleteCart: toCart(state, existingCart),
            },
        };
    }

    if (operationName === "CreateOrder") {
        const items = buildOrderItems(state, request.data?.items);
        const activeUser = getActiveUser(state);
        const now = new Date().toISOString();
        reserveInventory(state, items);
        const order: MockOrder = {
            id: allocateId(state, "order", "order"),
            status: "pending-payment",
            payerAddress: null,
            customer: activeUser?.id ?? null,
            transactions: [],
            cryptoPrices: buildOrderCryptoPrices(state, items),
            transactionHashes: [],
            currency: request.data?.currency ?? "USD",
            amount: computeCartSubtotal(state, items),
            customerEmail: request.data?.customerEmail ?? activeUser?.email ?? null,
            createdAt: now,
            updatedAt: now,
            items,
            shippingAddress: toShippingAddress(request.data?.shippingAddress),
        };
        state.orders = [...toArray(state.orders), order];

        return {
            data: {
                createOrder: toOrder(state, order),
            },
        };
    }

    if (operationName === "UpdateOrder") {
        const existingOrder = findRecord<MockOrder>(state, "orders", String(request.orderId));
        const notFound = ensureEntityExists(existingOrder, "updateOrder");

        if (notFound) {
            return notFound;
        }
        if (!existingOrder) {
            return notFound;
        }

        const nextTransactionHashes =
            request.data?.transactionHashes !== undefined
                ? normalizeTransactionHashes(state, request.data.transactionHashes)
                : toArray(existingOrder.transactionHashes);
        const nextOrder: MockOrder = {
            ...existingOrder,
            payerAddress:
                request.data?.payerAddress !== undefined ? request.data.payerAddress : existingOrder.payerAddress,
            status:
                request.data?.status ??
                (nextTransactionHashes.length > 0 ? "paid" : existingOrder.status ?? "pending-payment"),
            transactionHashes: nextTransactionHashes,
            shippingAddress:
                request.data?.shippingAddress !== undefined
                    ? toShippingAddress(request.data.shippingAddress)
                    : existingOrder.shippingAddress,
            updatedAt: new Date().toISOString(),
        };
        state.orders = toArray(state.orders).map((order) => {
            return order.id === existingOrder.id ? nextOrder : order;
        });

        return {
            data: {
                updateOrder: toOrder(state, nextOrder),
            },
        };
    }

    if (operationName === "UpdateUserById") {
        const existingUser = findRecord<MockUser>(state, "users", String(request.id));
        const notFound = ensureEntityExists(existingUser, "updateUser");

        if (notFound) {
            return notFound;
        }
        if (!existingUser) {
            return notFound;
        }

        const nextUser: MockUser = {
            ...existingUser,
            name: request.data?.name ?? existingUser.name ?? null,
            email: request.data?.email ?? existingUser.email ?? null,
            phone: request.data?.phone ?? existingUser.phone ?? null,
            shippingAddress:
                request.data?.shippingAddress !== undefined
                    ? toShippingAddress(request.data.shippingAddress)
                    : existingUser.shippingAddress ?? null,
            wallets:
                request.data?.wallets !== undefined
                    ? toArray(request.data.wallets).map((wallet) => ({
                          address: wallet.address ?? null,
                          provider: wallet.provider ?? null,
                          chain: wallet.chain ?? null,
                      }))
                    : existingUser.wallets ?? [],
        };
        state.users = toArray(state.users).map((user) => {
            return user.id === existingUser.id ? nextUser : user;
        });

        return {
            data: {
                updateUser: {
                    id: nextUser.id,
                    name: nextUser.name ?? null,
                    email: nextUser.email ?? null,
                    phone: nextUser.phone ?? null,
                    shippingAddress: nextUser.shippingAddress ?? null,
                    wallets: nextUser.wallets ?? [],
                },
            },
        };
    }

    return null;
};
