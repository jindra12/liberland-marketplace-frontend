import {
    OrderUpdate_TransactionHashes_Chain_MutationInput,
    UserUpdate_Wallets_Chain_MutationInput,
} from "../../../generated/graphql";
import type { MeUserQuery, MutationUserUpdate_WalletsInput } from "../../../generated/graphql";
import type { CartForRequiredChains, CryptoChain, OrderForPayments } from "../../../types";
import { getPrimaryCryptoAddress } from "../../shared/product/utils";
import { CRYPTO_CHAIN_DECIMALS, CRYPTO_CHAIN_ORDER } from "../constants";
import type {
    PaymentProfileUsersByUrl,
    PaymentProfileUser,
    PaymentWalletSelection,
    SubmittedOrder,
    TransactionHashUpdateRow,
} from "../types";

type OrderItem = NonNullable<NonNullable<Pick<OrderForPayments, "items">["items"]>[number]>;

export const toCryptoChain = (value?: string | null): CryptoChain | undefined => {
    switch (value?.toLowerCase()) {
        case "ethereum":
        case "solana":
        case "tron":
            return value.toLowerCase() as CryptoChain;
        default:
            return undefined;
    }
};

export const buildOrderEntryKey = (url: string, orderId: string): string => {
    return `${url}::${orderId}`;
};

export const buildPaymentKey = (entry: SubmittedOrder, chain: CryptoChain): string => {
    return `${entry.url}::${entry.order.id}::${chain}`;
};

const resolveItemPaymentChain = (item: OrderItem): CryptoChain | undefined => {
    const productAddress = getPrimaryCryptoAddress(item.product);
    const companyAddress = getPrimaryCryptoAddress(item.product?.company);

    return toCryptoChain(productAddress?.chain) ?? toCryptoChain(companyAddress?.chain);
};

const resolveProductNativePrice = (item: OrderItem, chain: CryptoChain): string | null | undefined => {
    switch (chain) {
        case "ethereum":
            return item.product?.priceInETH;
        case "solana":
            return item.product?.priceInSOL;
        case "tron":
            return item.product?.priceInTRX;
    }
};

const toFixedNativeUnits = (value: string | null | undefined, decimals: number): bigint => {
    const [wholePart = "0", fractionPartRaw = ""] = String(value ?? "0").split(".");
    const fractionPart = fractionPartRaw.slice(0, decimals).padEnd(decimals, "0");
    const factor = Array.from({ length: decimals }).reduce<bigint>((accumulator) => {
        return accumulator * 10n;
    }, 1n);
    const wholeUnits = BigInt(wholePart) * factor;
    const fractionUnits = fractionPart ? BigInt(fractionPart) : 0n;
    return wholeUnits + fractionUnits;
};

const formatFixedNativeUnits = (units: bigint, decimals: number): string => {
    if (units === 0n) {
        return "0";
    }

    const factor = Array.from({ length: decimals }).reduce<bigint>((accumulator) => {
        return accumulator * 10n;
    }, 1n);
    const wholePart = units / factor;
    const fractionPart = units % factor;

    if (fractionPart === 0n) {
        return wholePart.toString();
    }

    const fractionText = fractionPart.toString().padStart(decimals, "0").replace(/0+$/, "");
    return `${wholePart.toString()}.${fractionText}`;
};

const toTransactionHashChainInput = (chain: CryptoChain): OrderUpdate_TransactionHashes_Chain_MutationInput => {
    switch (chain) {
        case "ethereum":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Ethereum;
        case "solana":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Solana;
        case "tron":
            return OrderUpdate_TransactionHashes_Chain_MutationInput.Tron;
    }
};

const toUserUpdateWalletChain = (chain: CryptoChain): UserUpdate_Wallets_Chain_MutationInput => {
    switch (chain) {
        case "ethereum":
            return UserUpdate_Wallets_Chain_MutationInput.Ethereum;
        case "solana":
            return UserUpdate_Wallets_Chain_MutationInput.Solana;
        case "tron":
            return UserUpdate_Wallets_Chain_MutationInput.Tron;
    }
};

export const collectRequiredChainsForCarts = (carts: CartForRequiredChains[]): CryptoChain[] => {
    const chains = carts.reduce<Set<CryptoChain>>((chainSet, cart) => {
        return (cart.items ?? []).reduce<Set<CryptoChain>>((itemChainSet, item) => {
            const productChain = toCryptoChain(item?.product?.cryptoAddresses?.chain);
            const companyChain = toCryptoChain(item?.product?.company?.cryptoAddresses?.chain);

            if (productChain) {
                itemChainSet.add(productChain);
            }

            if (companyChain) {
                itemChainSet.add(companyChain);
            }

            return itemChainSet;
        }, chainSet);
    }, new Set<CryptoChain>());

    return Array.from(chains);
};

export const findPaymentWalletForChain = (
    user: PaymentProfileUser | undefined,
    chain: CryptoChain,
): PaymentWalletSelection | undefined => {
    return user?.wallets.find((wallet) => {
        return wallet.chain === chain;
    });
};

export const resolveOrderRecipientAddress = (
    order: Pick<OrderForPayments, "items">,
    chain: CryptoChain,
): string | undefined => {
    return (order.items ?? []).reduce<string | undefined>((resolvedAddress, item) => {
        if (resolvedAddress) {
            return resolvedAddress;
        }

        const productAddress = getPrimaryCryptoAddress(item?.product);
        const productChain = toCryptoChain(productAddress?.chain);

        if (productChain === chain && productAddress?.address) {
            return productAddress.address;
        }

        const companyAddress = getPrimaryCryptoAddress(item?.product?.company);
        const companyChain = toCryptoChain(companyAddress?.chain);

        if (companyChain === chain && companyAddress?.address) {
            return companyAddress.address;
        }

        return undefined;
    }, undefined);
};

export const buildPaymentProfileUsersByUrl = (
    meUsers: MeUserQuery | MeUserQuery[] | undefined,
    urls: string[],
): PaymentProfileUsersByUrl => {
    const entries = Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : [];

    return urls.reduce<PaymentProfileUsersByUrl>((result, url, index) => {
        const user = entries[index]?.meUser?.user;

        return {
            ...result,
            [url]: user
                ? {
                      id: user.id,
                      wallets: (user.wallets ?? []).flatMap((wallet) => {
                          const chain = toCryptoChain(wallet?.chain);

                          if (!chain || !wallet?.provider || !wallet.address) {
                              return [];
                          }

                          return [
                              {
                                  address: wallet.address,
                                  chain,
                                  provider: wallet.provider,
                              },
                          ];
                      }),
                  }
                : undefined,
        };
    }, {});
};

export const hasPaymentWalletSelection = (
    wallets: PaymentWalletSelection[],
    selection: PaymentWalletSelection,
): boolean => {
    return wallets.some((wallet) => {
        return (
            wallet.address === selection.address &&
            wallet.chain === selection.chain &&
            wallet.provider === selection.provider
        );
    });
};

export const appendPaymentWalletSelection = (
    wallets: PaymentWalletSelection[],
    selection: PaymentWalletSelection,
): PaymentWalletSelection[] => {
    if (hasPaymentWalletSelection(wallets, selection)) {
        return wallets;
    }

    return [...wallets, selection];
};

export const toUserUpdateWalletInputs = (wallets: PaymentWalletSelection[]): MutationUserUpdate_WalletsInput[] => {
    return wallets.map((wallet) => ({
        address: wallet.address,
        chain: toUserUpdateWalletChain(wallet.chain),
        provider: wallet.provider,
    }));
};

export const collectProductIdsForChain = (order: Pick<OrderForPayments, "items">, chain: CryptoChain): string[] => {
    return Array.from(
        new Set(
            (order.items ?? []).reduce<string[]>((productIds, item) => {
                const productId = item.product?.id;

                if (!productId || resolveItemPaymentChain(item) !== chain) {
                    return productIds;
                }

                productIds.push(productId);
                return productIds;
            }, []),
        ),
    );
};

export type ChainPaymentAmount = {
    chain: CryptoChain;
    amountInSmallestUnit: bigint;
    amount: string;
};

export const collectOrderChainPaymentAmounts = (order: Pick<OrderForPayments, "items">): ChainPaymentAmount[] => {
    const totals = (order.items ?? []).reduce<Partial<Record<CryptoChain, bigint>>>((result, item) => {
        const chain = resolveItemPaymentChain(item);

        if (!chain) {
            return result;
        }

        const quantity = BigInt(item.quantity ?? 0);
        const unitPrice = toFixedNativeUnits(resolveProductNativePrice(item, chain), CRYPTO_CHAIN_DECIMALS[chain]);
        const lineTotal = unitPrice * quantity;

        return {
            ...result,
            [chain]: (result[chain] ?? 0n) + lineTotal,
        };
    }, {});

    return CRYPTO_CHAIN_ORDER.map((chain) => {
        const amountInSmallestUnit = totals[chain] ?? 0n;

        if (amountInSmallestUnit <= 0n) {
            return undefined;
        }

        return {
            chain,
            amountInSmallestUnit,
            amount: formatFixedNativeUnits(amountInSmallestUnit, CRYPTO_CHAIN_DECIMALS[chain]),
        };
    }).filter((entry): entry is ChainPaymentAmount => Boolean(entry));
};

export const toExistingTransactionHashRows = (
    order: Pick<OrderForPayments, "transactionHashes">,
): TransactionHashUpdateRow[] => {
    return (order.transactionHashes ?? []).reduce<TransactionHashUpdateRow[]>((rows, entry) => {
        const productId = entry?.product?.id;
        const transactionHash = entry?.transactionHash;
        const chain = entry?.chain ? toCryptoChain(entry.chain) : undefined;

        if (!productId || !transactionHash || !chain) {
            return rows;
        }

        rows.push({
            id: entry.id,
            product: productId,
            chain: toTransactionHashChainInput(chain),
            transactionHash,
        });
        return rows;
    }, []);
};

export const appendTransactionHashRows = (props: {
    existingRows: TransactionHashUpdateRow[];
    productIds: string[];
    chain: CryptoChain;
    txHash: string;
}): { nextRows: TransactionHashUpdateRow[]; appendedCount: number } => {
    const existingKeys = new Set(
        props.existingRows.map((row) => `${row.product}::${row.chain}::${row.transactionHash}`),
    );
    const appendedRows = props.productIds.reduce<TransactionHashUpdateRow[]>((rows, productId) => {
        const key = `${productId}::${props.chain}::${props.txHash}`;

        if (existingKeys.has(key)) {
            return rows;
        }

        existingKeys.add(key);
        rows.push({
            product: productId,
            chain: toTransactionHashChainInput(props.chain),
            transactionHash: props.txHash,
        });
        return rows;
    }, []);

    return {
        nextRows: [...props.existingRows, ...appendedRows],
        appendedCount: appendedRows.length,
    };
};

export const replaceSubmittedOrderInList = (
    submittedOrders: SubmittedOrder[],
    updated: SubmittedOrder,
): SubmittedOrder[] => {
    return submittedOrders.map((entry) => {
        return entry.url === updated.url && entry.order.id === updated.order.id ? updated : entry;
    });
};
