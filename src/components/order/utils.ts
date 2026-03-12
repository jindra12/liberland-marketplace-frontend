import { OrderUpdate_TransactionHashes_Chain_MutationInput } from "../../generated/graphql";
import type { CryptoChain, OrderForPayments } from "../../types";
import { toCryptoChain } from "../../utils";
import type { SubmittedOrder, TransactionHashUpdateRow } from "./types";

type OrderItem = NonNullable<NonNullable<Pick<OrderForPayments, "items">["items"]>[number]>;

const CHAIN_DECIMALS: Record<CryptoChain, number> = {
    ethereum: 18,
    solana: 9,
    tron: 6,
};

const CHAIN_ORDER: CryptoChain[] = ["ethereum", "solana", "tron"];

const toFixedNativeUnits = (value: string | null | undefined, decimals: number): bigint => {
    const [wholePartRaw = "0", fractionPartRaw = ""] = String(value || "0").split(".");
    const wholePart = wholePartRaw || "0";
    const fractionPart = fractionPartRaw.slice(0, decimals).padEnd(decimals, "0");
    const factor = 10n ** BigInt(decimals);
    const wholeUnits = BigInt(wholePart) * factor;
    const fractionUnits = fractionPart ? BigInt(fractionPart) : 0n;
    return wholeUnits + fractionUnits;
};

const formatFixedNativeUnits = (units: bigint, decimals: number): string => {
    if (units === 0n) {
        return "0";
    }

    const factor = 10n ** BigInt(decimals);
    const whole = units / factor;
    const fraction = units % factor;

    if (fraction === 0n) {
        return whole.toString();
    }

    const fractionText = fraction.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${whole.toString()}.${fractionText}`;
};

const resolveItemPaymentChain = (item: OrderItem): CryptoChain | undefined => {
    const productChain = toCryptoChain(item.product?.cryptoAddresses?.chain);
    if (productChain) {
        return productChain;
    }

    const companyChain = toCryptoChain(item.product?.company?.cryptoAddresses?.chain);
    if (companyChain) {
        return companyChain;
    }

    return undefined;
};

const resolveProductNativePrice = (item: OrderItem, chain: CryptoChain): string | undefined => {
    switch (chain) {
        case "ethereum":
            return item.product?.priceInETH || undefined;
        case "solana":
            return item.product?.priceInSOL || undefined;
        case "tron":
            return item.product?.priceInTRX || undefined;
    }
};

const toTransactionHashChainInput = (
    chain: CryptoChain,
): OrderUpdate_TransactionHashes_Chain_MutationInput => {
    switch (chain) {
        case "ethereum":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Ethereum;
        case "solana":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Solana;
        case "tron":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Tron;
    }
};

const toTransactionHashChainInputFromUnknown = (
    chain: unknown,
): OrderUpdate_TransactionHashes_Chain_MutationInput | null => {
    switch (chain) {
        case "ethereum":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Ethereum;
        case "solana":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Solana;
        case "tron":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Tron;
        default:
            return null;
    }
};

export const buildPaymentKey = (entry: SubmittedOrder, chain: CryptoChain): string => {
    return `${entry.url}::${entry.order.id}::${chain}`;
};

export const collectProductIdsForChain = (
    order: Pick<OrderForPayments, "items">,
    chain: CryptoChain,
): string[] => {
    return Array.from(
        new Set(
            (order.items || []).reduce<string[]>((acc, item) => {
                const productId = item.product?.id;
                if (!productId) {
                    return acc;
                }

                if (resolveItemPaymentChain(item) === chain) {
                    acc.push(productId);
                }

                return acc;
            }, []),
        ),
    );
};

export type ChainPaymentAmount = {
    chain: CryptoChain;
    amountInSmallestUnit: bigint;
    amount: string;
};

export const collectOrderChainPaymentAmounts = (
    order: Pick<OrderForPayments, "items">,
): ChainPaymentAmount[] => {
    const totals = (order.items || []).reduce<Partial<Record<CryptoChain, bigint>>>((acc, item) => {
        const chain = resolveItemPaymentChain(item);
        if (!chain) {
            return acc;
        }

        const quantity = BigInt(item.quantity || 0);
        const nativePrice = resolveProductNativePrice(item, chain);
        const unitPrice = toFixedNativeUnits(nativePrice, CHAIN_DECIMALS[chain]);
        const lineTotal = unitPrice * quantity;
        acc[chain] = (acc[chain] || 0n) + lineTotal;
        return acc;
    }, {});

    return CHAIN_ORDER
        .map((chain) => {
            const amountInSmallestUnit = totals[chain] || 0n;
            if (amountInSmallestUnit <= 0n) {
                return undefined;
            }

            return {
                chain,
                amountInSmallestUnit,
                amount: formatFixedNativeUnits(amountInSmallestUnit, CHAIN_DECIMALS[chain]),
            };
        })
        .filter((entry): entry is ChainPaymentAmount => Boolean(entry));
};

export const toExistingTransactionHashRows = (
    order: Pick<OrderForPayments, "transactionHashes">,
): TransactionHashUpdateRow[] => {
    return (order.transactionHashes || []).reduce<TransactionHashUpdateRow[]>((acc, entry) => {
        const productId = entry?.product?.id;
        const hash = entry?.transactionHash;
        const chain = toTransactionHashChainInputFromUnknown(entry?.chain);

        if (!productId || !hash || !chain) {
            return acc;
        }

        acc.push({
            id: entry.id || undefined,
            product: productId,
            chain,
            transactionHash: hash,
        });
        return acc;
    }, []);
};

export const appendTransactionHashRows = ({
    existingRows,
    productIds,
    chain,
    txHash,
}: {
    existingRows: TransactionHashUpdateRow[];
    productIds: string[];
    chain: CryptoChain;
    txHash: string;
}): { nextRows: TransactionHashUpdateRow[]; appendedCount: number } => {
    const existingKeys = new Set(
        existingRows.map((row) => `${row.product}::${row.chain}::${row.transactionHash}`),
    );

    const appendedRows = productIds.reduce<TransactionHashUpdateRow[]>((acc, productId) => {
        const key = `${productId}::${chain}::${txHash}`;
        if (existingKeys.has(key)) {
            return acc;
        }

        existingKeys.add(key);
        acc.push({
            product: productId,
            chain: toTransactionHashChainInput(chain),
            transactionHash: txHash,
        });
        return acc;
    }, []);

    return {
        nextRows: [...existingRows, ...appendedRows],
        appendedCount: appendedRows.length,
    };
};

export const replaceSubmittedOrderInList = (
    submittedOrders: SubmittedOrder[],
    updated: SubmittedOrder,
): SubmittedOrder[] => {
    return submittedOrders.map((entry) => (
        entry.url === updated.url && entry.order.id === updated.order.id
            ? updated
            : entry
    ));
};
