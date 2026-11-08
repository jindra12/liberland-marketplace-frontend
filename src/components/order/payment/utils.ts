import {
    OrderUpdate_PaymentProofs_Chain_MutationInput,
    UserUpdate_Wallets_Chain_MutationInput,
} from "../../../generated/graphql";
import BigNumber from "bignumber.js";
import type { MutationUserUpdate_WalletsInput } from "../../../generated/graphql";
import type { BackendUserQuery } from "../../query/types";
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

export const buildPaymentKey = (entry: SubmittedOrder, chain: CryptoChain, recipient?: string): string => {
    return `${entry.url}::${entry.order.id}::${chain}::${recipient || ""}`;
};

const resolveItemPaymentChain = (item: OrderItem): CryptoChain | undefined => {
    const productAddress = getPrimaryCryptoAddress(item.product);
    const companyAddress = getPrimaryCryptoAddress(item.product?.company);

    return toCryptoChain(productAddress?.chain) ?? toCryptoChain(companyAddress?.chain);
};

const resolveItemPaymentRecipient = (item: OrderItem, chain: CryptoChain): string | undefined => {
    const productAddress = getPrimaryCryptoAddress(item.product);
    const companyAddress = getPrimaryCryptoAddress(item.product?.company);
    const productChain = toCryptoChain(productAddress?.chain);
    const companyChain = toCryptoChain(companyAddress?.chain);

    if (productChain === chain && productAddress?.address) {
        return productAddress.address;
    }

    if (companyChain === chain && companyAddress?.address) {
        return companyAddress.address;
    }

    return undefined;
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

const toTransactionHashChainInput = (chain: CryptoChain): OrderUpdate_PaymentProofs_Chain_MutationInput => {
    switch (chain) {
        case "ethereum":
            return OrderUpdate_PaymentProofs_Chain_MutationInput.Ethereum;
        case "solana":
            return OrderUpdate_PaymentProofs_Chain_MutationInput.Solana;
        case "tron":
            return OrderUpdate_PaymentProofs_Chain_MutationInput.Tron;
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
    meUsers: BackendUserQuery | BackendUserQuery[] | undefined,
    urls: string[],
): PaymentProfileUsersByUrl => {
    const entries = Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : [];

    return urls.reduce<PaymentProfileUsersByUrl>((result, url) => {
        const user = entries.find((entry) => entry.serverURL === url)?.meUser?.user;

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

export type ChainPaymentAmount = {
    chain: CryptoChain;
    recipient: string;
    productIds: string[];
    amountInSmallestUnit: bigint;
    amount: string;
};

export const collectOrderChainPaymentAmounts = (
    order: Pick<OrderForPayments, "items" | "paymentTargets" | "cryptoPrices">,
): ChainPaymentAmount[] => {
    if (!order.paymentTargets?.length) {
        // An old snapshot can only be allocated safely when it has exactly one payout destination.
        const destinations = (order.items ?? []).flatMap((item) => {
            const chain = resolveItemPaymentChain(item);
            const recipient = chain && resolveItemPaymentRecipient(item, chain);
            return chain && recipient && item.product?.id ? [{ chain, recipient, productId: item.product.id }] : [];
        });
        const first = destinations[0];
        if (
            !first ||
            destinations.some((entry) => entry.chain !== first.chain || entry.recipient !== first.recipient)
        ) {
            return [];
        }
        const amount = order.cryptoPrices?.find((price) => price.chain === first.chain)?.expectedNativeAmount;
        return amount && new BigNumber(amount).isFinite() && new BigNumber(amount).gt(0)
            ? [
                  {
                      chain: first.chain,
                      recipient: first.recipient,
                      productIds: [...new Set(destinations.map((entry) => entry.productId))],
                      amount,
                      amountInSmallestUnit: toFixedNativeUnits(amount, CRYPTO_CHAIN_DECIMALS[first.chain]),
                  },
              ]
            : [];
    }

    const groups = Object.groupBy(
        order.paymentTargets,
        (target) => `${target.chain}::${target.normalizedRecipientAddress || target.recipientAddress}`,
    );
    return CRYPTO_CHAIN_ORDER.flatMap((chain) =>
        Object.values(groups).flatMap((targets) => {
            const first = targets?.[0];
            if (!first || first.chain !== chain || !first.recipientAddress) {
                return [];
            }
            const rate = new BigNumber(
                order.cryptoPrices?.find((price) => price.chain === chain)?.nativePerStable || "0",
            );
            if (
                !rate.isFinite() ||
                !rate.gt(0) ||
                targets.some(
                    (target) =>
                        !target.productID ||
                        target.stableAmount === null ||
                        target.stableAmount === undefined ||
                        !Number.isFinite(target.stableAmount) ||
                        target.stableAmount < 0,
                )
            ) {
                return [];
            }
            const stableAmount = targets.reduce((total, target) => total.plus(target.stableAmount!), new BigNumber(0));
            const amount = stableAmount
                .times(rate)
                .decimalPlaces(CRYPTO_CHAIN_DECIMALS[chain], BigNumber.ROUND_DOWN)
                .toFixed();
            return new BigNumber(amount).gt(0)
                ? [
                      {
                          chain,
                          recipient: first.recipientAddress,
                          productIds: [...new Set(targets.map((target) => target.productID!))],
                          amount,
                          amountInSmallestUnit: toFixedNativeUnits(amount, CRYPTO_CHAIN_DECIMALS[chain]),
                      },
                  ]
                : [];
        }),
    );
};

export const toExistingTransactionHashRows = (
    order: Pick<OrderForPayments, "paymentProofs">,
): TransactionHashUpdateRow[] => {
    return (order.paymentProofs ?? []).reduce<TransactionHashUpdateRow[]>((rows, entry) => {
        const productId = entry.product?.id;
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
            fulfilled: entry.fulfilled,
            rejected: entry.rejected,
        });
        return rows;
    }, []);
};

const paymentProofKey = (product: TransactionHashUpdateRow["product"], chain: string, hash: string): string =>
    `${product}::${chain}::${chain === "solana" ? hash : hash.toLowerCase()}`;

export const appendTransactionHashRows = (props: {
    existingRows: TransactionHashUpdateRow[];
    productIds: string[];
    chain: CryptoChain;
    txHash: string;
}): { nextRows: TransactionHashUpdateRow[]; appendedCount: number } => {
    const existingKeys = new Set(
        props.existingRows.map((row) => paymentProofKey(row.product, row.chain!, row.transactionHash!)),
    );
    const appendedRows = props.productIds.reduce<TransactionHashUpdateRow[]>((rows, productId) => {
        const key = paymentProofKey(productId, props.chain, props.txHash);

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
