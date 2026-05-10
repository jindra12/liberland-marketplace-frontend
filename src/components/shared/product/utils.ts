import Autolinker from "autolinker";
import type { CryptoWalletOwner, PurchasableProduct } from "../../../types";
import { isCryptoCurrency } from "../../publish/constants";

const getCryptoFractionDigits = (currency: string, fallback: number): number => {
    return isCryptoCurrency(currency) ? 6 : fallback;
};

export const formatPrice = (amount?: number | null, currency?: string | null): string | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    const resolvedCurrency = currency ?? "USD";
    const fallbackFractionDigits = Number.isInteger(amount) ? 0 : 2;
    const formattedAmount = amount.toLocaleString("en-US", {
        maximumFractionDigits: getCryptoFractionDigits(resolvedCurrency, fallbackFractionDigits),
    });

    return `${resolvedCurrency} ${formattedAmount}`;
};

export const fromCents = (amount?: number | null): number | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    return amount / 100;
};

export const toCents = (amount?: number | null): number | null => {
    if (amount === null || amount === undefined) {
        return null;
    }

    return Math.round(amount * 100);
};

export const formatPriceFromCents = (amount?: number | null, currency?: string | null): string | null => {
    return formatPrice(fromCents(amount), currency);
};

export const formatUsdFromCents = (amount?: number | null): string | null => {
    const dollars = fromCents(amount);

    if (dollars === null || dollars === undefined) {
        return null;
    }

    return dollars.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export const parseActionLink = (value?: string | null): string | undefined => {
    if (!value) {
        return undefined;
    }

    const [match] = Autolinker.parse(value, {
        mention: false,
        hashtag: false,
    });

    return match?.getAnchorHref();
};

type CryptoAddressLike = {
    chain?: string | null;
    address?: string | null;
};

export const getPrimaryCryptoAddress = (
    entity?: { cryptoAddresses?: CryptoAddressLike | CryptoAddressLike[] | null } | null,
) => {
    const addresses = entity?.cryptoAddresses;

    if (Array.isArray(addresses)) {
        return addresses.find((address) => Boolean(address?.address) || Boolean(address?.chain));
    }

    return addresses;
};

export const hasCryptoWallet = (entity?: CryptoWalletOwner | null): boolean => {
    return Boolean(getPrimaryCryptoAddress(entity)?.address);
};

export const isProductPurchasable = (product?: PurchasableProduct | null): boolean => {
    return Boolean(product?.orderable) && (hasCryptoWallet(product) || hasCryptoWallet(product?.company));
};
