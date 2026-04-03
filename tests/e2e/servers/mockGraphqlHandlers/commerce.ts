import type { JsonValue, MockScenarioState } from "../types";
import { allocateId, getActiveUser, normalizeChain, normalizeRelationId, toArray } from "./shared";
import { findVariantRecord, resolveInventoryLimit, resolveUsdPrice, toCreatedBy, toProduct, toVariantType } from "./entities";

export const buildCartItems = (
    state: MockScenarioState,
    inputItems: Array<{ id?: JsonValue; product?: JsonValue; quantity?: JsonValue; variant?: JsonValue }> | undefined,
) => {
    return toArray(inputItems).reduce<Array<{ id: string; product?: string | null; quantity?: number | null; variant?: string | null }>>((items, item) => {
        const productId = normalizeRelationId(item.product);
        const variantId = normalizeRelationId(item.variant);
        const product = productId ? toArray(state.products).find((entry) => entry.id === productId) : undefined;

        if (!product || product.orderable !== true) {
            return items;
        }

        const requestedQuantity = Math.max(0, Number(item.quantity ?? 0));
        const inventoryLimit = resolveInventoryLimit(product, variantId);
        const quantity =
            typeof inventoryLimit === "number" ? Math.min(requestedQuantity, inventoryLimit) : requestedQuantity;

        if (quantity <= 0) {
            return items;
        }

        return [
            ...items,
            {
                id: normalizeRelationId(item.id) ?? allocateId(state, "cart", "cart-item"),
                quantity,
                product: productId,
                variant: variantId,
            },
        ];
    }, []);
};

export const computeCartSubtotal = (
    state: MockScenarioState,
    items: Array<{ product?: string | null; quantity?: number | null; variant?: string | null }>,
) => {
    return items.reduce((subtotal, item) => {
        const product = item.product ? toArray(state.products).find((entry) => entry.id === item.product) : undefined;
        return subtotal + resolveUsdPrice(product, item.variant) * Number(item.quantity ?? 0);
    }, 0);
};

export const toCartItem = (state: MockScenarioState, item: { id: string; product?: string | null; quantity?: number | null; variant?: string | null }) => {
    const product = item.product ? toArray(state.products).find((entry) => entry.id === item.product) : undefined;
    const variant = product && item.variant ? findVariantRecord(product, item.variant) : undefined;

    return {
        id: item.id,
        quantity: item.quantity ?? 0,
        product: product ? toProduct(state, product) : null,
        variant: variant
            ? {
                  id: variant.id,
                  title: variant.title ?? null,
                  inventory: variant.inventory ?? null,
                  priceInUSD: variant.priceInUSD ?? null,
                  priceInUSDEnabled: variant.priceInUSDEnabled ?? null,
                  options: toArray(variant.options).map((option) => ({
                      id: option.id,
                      label: option.label ?? null,
                      value: option.value ?? null,
                      variantType: toVariantType(
                          toArray(product?.variantTypes).find((variantType) => variantType.id === option.variantType),
                      ),
                  })),
              }
            : null,
    };
};

export const toCart = (
    state: MockScenarioState,
    cart: {
        createdAt?: string | null;
        currency?: string | null;
        customer?: string | null;
        id: string;
        items?: Array<{ id: string; product?: string | null; quantity?: number | null; variant?: string | null }>;
        purchasedAt?: string | null;
        secret?: string | null;
        status?: string | null;
        subtotal?: number | null;
        updatedAt?: string | null;
    },
) => {
    return {
        id: cart.id,
        secret: cart.secret ?? null,
        status: cart.status ?? "active",
        currency: cart.currency ?? "USD",
        subtotal: cart.subtotal ?? computeCartSubtotal(state, toArray(cart.items)),
        createdAt: cart.createdAt ?? null,
        updatedAt: cart.updatedAt ?? null,
        purchasedAt: cart.purchasedAt ?? null,
        customer: cart.customer ? toCreatedBy(state, cart.customer) : null,
        items: toArray(cart.items).map((item) => toCartItem(state, item)),
    };
};

export const collectChainTotals = (
    state: MockScenarioState,
    items: Array<{ product?: string | null; quantity?: number | null; variant?: string | null }>,
) => {
    return items.reduce<Record<string, number>>((totals, item) => {
        const product = item.product ? toArray(state.products).find((entry) => entry.id === item.product) : undefined;
        const company = product?.company ? toArray(state.companies).find((entry) => entry.id === product.company) : undefined;
        const chain = normalizeChain(product?.cryptoAddresses?.chain) ?? normalizeChain(company?.cryptoAddresses?.chain);

        if (!chain) {
            return totals;
        }

        const unitPrice =
            chain === "ethereum"
                ? Number(product?.priceInETH ?? 0)
                : chain === "solana"
                  ? Number(product?.priceInSOL ?? 0)
                  : Number(product?.priceInTRX ?? 0);

        return {
            ...totals,
            [chain]: (totals[chain] ?? 0) + unitPrice * Number(item.quantity ?? 0),
        };
    }, {});
};

export const buildOrderCryptoPrices = (
    state: MockScenarioState,
    items: Array<{ product?: string | null; quantity?: number | null; variant?: string | null }>,
) => {
    const chainTotals = collectChainTotals(state, items);
    const usdTotal = computeCartSubtotal(state, items);

    return Object.entries(chainTotals).map(([chain, expectedNativeAmount]) => {
        const stablePerNative =
            expectedNativeAmount > 0 ? (usdTotal / expectedNativeAmount).toFixed(6).replace(/0+$/, "").replace(/\.$/, "") : "0";
        const nativePerStable =
            usdTotal > 0 ? (expectedNativeAmount / usdTotal).toFixed(10).replace(/0+$/, "").replace(/\.$/, "") : "0";

        return {
            id: allocateId(state, "order", "order-price"),
            chain,
            stablePerNative,
            nativePerStable,
            expectedNativeAmount: String(expectedNativeAmount),
            fetchedAt: new Date().toISOString(),
        };
    });
};

export const normalizeTransactionHashes = (
    state: MockScenarioState,
    rows: Array<{ chain?: JsonValue; id?: JsonValue; product?: JsonValue; transactionHash?: JsonValue }> | undefined,
) => {
    return toArray(rows).reduce<Array<{ chain: string; id: string; product: string | null; transactionHash: string }>>((transactionHashes, row) => {
        const productId = normalizeRelationId(row.product);
        const transactionHash = String(row.transactionHash ?? "");
        const chain = normalizeChain(row.chain);

        if (!productId || !transactionHash || !chain) {
            return transactionHashes;
        }

        return [
            ...transactionHashes,
            {
                id: normalizeRelationId(row.id) ?? allocateId(state, "transactionHash", "transaction-hash"),
                product: productId,
                chain,
                transactionHash,
            },
        ];
    }, []);
};

export const reserveInventory = (
    state: MockScenarioState,
    items: Array<{ product?: string | null; quantity?: number | null; variant?: string | null }>,
) => {
    toArray(items).forEach((item) => {
        const product = item.product ? toArray(state.products).find((entry) => entry.id === item.product) : undefined;

        if (!product) {
            return;
        }

        if (typeof product.inventory === "number") {
            product.inventory = Math.max(0, product.inventory - Number(item.quantity ?? 0));
        }

        const variant = item.variant ? findVariantRecord(product, item.variant) : undefined;

        if (variant && typeof variant.inventory === "number") {
            variant.inventory = Math.max(0, variant.inventory - Number(item.quantity ?? 0));
        }
    });
};

export const buildOrderItems = (
    state: MockScenarioState,
    inputItems: Array<{ id?: JsonValue; product?: JsonValue; quantity?: JsonValue; variant?: JsonValue }> | undefined,
) => {
    return buildCartItems(state, inputItems).map((item) => ({
        id: item.id.replace("cart-item", "order-item"),
        quantity: item.quantity,
        product: item.product,
        variant: item.variant,
    }));
};

export const toOrderItem = (state: MockScenarioState, item: { id: string; product?: string | null; quantity?: number | null; variant?: string | null }) => {
    const product = item.product ? toArray(state.products).find((entry) => entry.id === item.product) : undefined;
    const variant = product && item.variant ? findVariantRecord(product, item.variant) : undefined;

    return {
        id: item.id,
        quantity: item.quantity ?? 0,
        product: product ? toProduct(state, product) : null,
        variant: variant
            ? {
                  id: variant.id,
                  title: variant.title ?? null,
              }
            : null,
    };
};

export const toOrder = (
    state: MockScenarioState,
    order: {
        amount?: number | null;
        createdAt?: string | null;
        cryptoPrices?: Array<JsonValue>;
        currency?: string | null;
        customer?: string | null;
        customerEmail?: string | null;
        id: string;
        items?: Array<{ id: string; product?: string | null; quantity?: number | null; variant?: string | null }>;
        payerAddress?: string | null;
        shippingAddress?: JsonValue;
        status?: string | null;
        transactionHashes?: Array<{ chain?: string | null; id: string; product?: string | null; transactionHash?: string | null }>;
        transactions?: Array<string | { id: string }>;
        updatedAt?: string | null;
    },
) => {
    return {
        id: order.id,
        status: order.status ?? "pending-payment",
        payerAddress: order.payerAddress ?? null,
        customer: order.customer ? { id: order.customer } : null,
        transactions: toArray(order.transactions).map((transactionId) => ({
            id: typeof transactionId === "string" ? transactionId : transactionId.id,
        })),
        cryptoPrices: toArray(order.cryptoPrices),
        transactionHashes: toArray(order.transactionHashes).map((entry) => ({
            id: entry.id,
            chain: entry.chain,
            transactionHash: entry.transactionHash,
            product: entry.product ? { id: entry.product } : null,
        })),
        currency: order.currency ?? "USD",
        amount: order.amount ?? computeCartSubtotal(state, toArray(order.items)),
        customerEmail: order.customerEmail ?? getActiveUser(state)?.email ?? null,
        createdAt: order.createdAt ?? null,
        updatedAt: order.updatedAt ?? null,
        items: toArray(order.items).map((item) => toOrderItem(state, item)),
        shippingAddress: order.shippingAddress ?? null,
    };
};
