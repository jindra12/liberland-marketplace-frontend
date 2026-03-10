import { OrderUpdate_TransactionHashes_Chain_MutationInput } from "../../generated/graphql";
import type { CryptoChain, OrderForPayments } from "../../types";
import type { SubmittedOrder, TransactionHashUpdateRow } from "./types";

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

                const productChain = item.product?.cryptoAddresses?.chain;
                const companyChain = item.product?.company?.cryptoAddresses?.chain;
                if (productChain === chain || companyChain === chain) {
                    acc.push(productId);
                }

                return acc;
            }, []),
        ),
    );
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
