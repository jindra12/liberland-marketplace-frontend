import objectHash from "object-hash";
import uniqBy from "lodash-es/uniqBy";
import { OrderUpdate_TransactionHashes_Chain_MutationInput, UserUpdate_Wallets_Chain_MutationInput } from "../../generated/graphql";
import type { MeUserQuery, MutationOrder_ShippingAddressInput, MutationUserUpdate_WalletsInput } from "../../generated/graphql";
import type { CryptoChain, OrderForPayments } from "../../types";
import { inferNameParts, toCryptoChain } from "../../utils";
import type { AddressWithEmail, OrderFormValues, PaymentProfileUsersByUrl, PaymentWalletSelection, SubmittedOrder, TransactionHashUpdateRow } from "./types";

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

const toTransactionHashChainInputFromUnknown = (chain: unknown): OrderUpdate_TransactionHashes_Chain_MutationInput | null => {
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

export const buildShippingAddressHeadline = (shippingAddress: AddressWithEmail) => {
    const name = [shippingAddress.firstName, shippingAddress.lastName].filter(Boolean).join(" ");

    if (name) {
        return name;
    }

    if (shippingAddress.company) {
        return shippingAddress.company;
    }

    return shippingAddress.email;
};

export const buildShippingAddressSummary = (shippingAddress: AddressWithEmail) => {
    return [shippingAddress.addressLine1, shippingAddress.addressLine2, shippingAddress.city, shippingAddress.state, shippingAddress.postalCode, shippingAddress.country].filter(Boolean).join(", ");
};

export const buildProfileShippingAddresses = (meUsers?: MeUserQuery | MeUserQuery[]) => {
    const allUsers = Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : [];

    return uniqBy(
        allUsers.flatMap((entry) => {
            const user = entry.meUser?.user;

            if (!user?.shippingAddress || !user.email) {
                return [];
            }

            const shippingAddress = {
                ...user.shippingAddress,
                email: user.email,
            };

            return [
                {
                    ...shippingAddress,
                    id: objectHash(shippingAddress),
                },
            ];
        }),
        ({ id }) => id,
    );
};

export const buildPaymentProfileUsersByUrl = (meUsers: MeUserQuery | MeUserQuery[] | undefined, urls: string[]): PaymentProfileUsersByUrl => {
    const entries = Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : [];

    return urls.reduce<PaymentProfileUsersByUrl>((acc, url, index) => {
        const user = entries[index]?.meUser?.user;

        if (!user?.id) {
            return {
                ...acc,
                [url]: undefined,
            };
        }

        return {
            ...acc,
            [url]: {
                id: user.id,
                wallets: (user.wallets || []).flatMap((wallet) => {
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
            },
        };
    }, {});
};

export const hasPaymentWalletSelection = (wallets: PaymentWalletSelection[], selection: PaymentWalletSelection) => {
    return wallets.some((wallet) => {
        return wallet.address === selection.address && wallet.chain === selection.chain && wallet.provider === selection.provider;
    });
};

export const appendPaymentWalletSelection = (wallets: PaymentWalletSelection[], selection: PaymentWalletSelection) => {
    if (hasPaymentWalletSelection(wallets, selection)) {
        return wallets;
    }

    return [...wallets, selection];
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

export const toUserUpdateWalletInputs = (wallets: PaymentWalletSelection[]): MutationUserUpdate_WalletsInput[] => {
    return wallets.map((wallet) => ({
        address: wallet.address,
        chain: toUserUpdateWalletChain(wallet.chain),
        provider: wallet.provider,
    }));
};

export const buildOrderPrefill = (meUsers?: MeUserQuery | MeUserQuery[]) => {
    const users = (Array.isArray(meUsers) ? meUsers : meUsers ? [meUsers] : []).flatMap((entry) => (entry.meUser?.user ? [entry.meUser.user] : []));
    const firstUser = users[0];
    const firstShippingAddress = users.find((user) => user.shippingAddress)?.shippingAddress;
    const inferredNames = inferNameParts(firstUser?.name);

    return {
        profileEmail: firstUser?.email,
        prefillFirstName: firstShippingAddress?.firstName || inferredNames.firstName,
        prefillLastName: firstShippingAddress?.lastName || inferredNames.lastName,
    };
};

export const toShippingAddressInput = (shippingAddress: AddressWithEmail): MutationOrder_ShippingAddressInput => {
    const { email: _email, id: _id, ...input } = shippingAddress;
    return input;
};

export const buildOrderFormValues = ({
    prefillFirstName,
    prefillLastName,
    profileEmail,
    savedShippingAddress,
}: {
    prefillFirstName?: string;
    prefillLastName?: string;
    profileEmail?: string;
    savedShippingAddress?: AddressWithEmail;
}): OrderFormValues => {
    if (savedShippingAddress) {
        return {
            customerEmail: savedShippingAddress.email,
            shippingAddress: toShippingAddressInput(savedShippingAddress),
        };
    }

    return {
        customerEmail: profileEmail || "",
        shippingAddress: {
            country: "United States",
            firstName: prefillFirstName,
            lastName: prefillLastName,
        },
    };
};

export const collectProductIdsForChain = (order: Pick<OrderForPayments, "items">, chain: CryptoChain): string[] => {
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

export const collectOrderChainPaymentAmounts = (order: Pick<OrderForPayments, "items">): ChainPaymentAmount[] => {
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

    return CHAIN_ORDER.map((chain) => {
        const amountInSmallestUnit = totals[chain] || 0n;
        if (amountInSmallestUnit <= 0n) {
            return undefined;
        }

        return {
            chain,
            amountInSmallestUnit,
            amount: formatFixedNativeUnits(amountInSmallestUnit, CHAIN_DECIMALS[chain]),
        };
    }).filter((entry): entry is ChainPaymentAmount => Boolean(entry));
};

export const toExistingTransactionHashRows = (order: Pick<OrderForPayments, "transactionHashes">): TransactionHashUpdateRow[] => {
    return (order.transactionHashes || []).reduce<TransactionHashUpdateRow[]>((acc, entry) => {
        const productId = entry?.product?.id;
        const hash = entry?.transactionHash;
        const chain = toTransactionHashChainInputFromUnknown(entry?.chain);

        if (!productId || !hash || !chain) {
            return acc;
        }

        acc.push({
            id: entry.id,
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
    const existingKeys = new Set(existingRows.map((row) => `${row.product}::${row.chain}::${row.transactionHash}`));

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

export const replaceSubmittedOrderInList = (submittedOrders: SubmittedOrder[], updated: SubmittedOrder): SubmittedOrder[] => {
    return submittedOrders.map((entry) => (entry.url === updated.url && entry.order.id === updated.order.id ? updated : entry));
};
