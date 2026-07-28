import type { SellerOrderProduct } from "./types";
import { ORDER_TRANSACTION_EXPLORER_BASE_URLS } from "./constants";

export const buildTransactionExplorerUrl = (chain: string, transactionHash: string): string => {
    const normalizedChain = chain.toLowerCase();

    switch (normalizedChain) {
        case "ethereum":
            return `${ORDER_TRANSACTION_EXPLORER_BASE_URLS.ethereum}${transactionHash}`;
        case "solana":
            return `${ORDER_TRANSACTION_EXPLORER_BASE_URLS.solana}${transactionHash}`;
        case "tron":
            return `${ORDER_TRANSACTION_EXPLORER_BASE_URLS.tron}${transactionHash}`;
        default:
            return transactionHash;
    }
};

export const formatShippingAddressLines = (order: SellerOrderProduct): string[] => {
    const shippingAddress = order.shippingAddress;

    if (!shippingAddress) {
        return [];
    }

    return [
        shippingAddress.addressLine1,
        shippingAddress.addressLine2,
        [shippingAddress.city, shippingAddress.state, shippingAddress.postalCode].filter(Boolean).join(", "),
        shippingAddress.country,
    ].filter(Boolean) as string[];
};

export const formatShippingContactLine = (order: SellerOrderProduct): string => {
    const shippingAddress = order.shippingAddress;

    return [order.customerEmail, shippingAddress?.phone].filter(Boolean).join(" · ");
};

export const getOrderStatusLabel = (order: SellerOrderProduct): string => {
    if (order.fulfilled) {
        return "Fulfilled";
    }

    if (order.rejected) {
        return "Rejected";
    }

    return "Pending";
};

export const getOrderStatusColor = (order: SellerOrderProduct): string => {
    if (order.fulfilled) {
        return "success";
    }

    if (order.rejected) {
        return "error";
    }

    return "red";
};
