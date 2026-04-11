import type { CryptoChain } from "../../types";

export const SAVED_SHIPPING_ADDRESS_STORAGE_KEY = "buyNow.savedShippingAddresses";

export const CRYPTO_CHAIN_LABELS: Record<CryptoChain, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
    tron: "Tron",
};

export const CRYPTO_CHAIN_TICKERS: Record<CryptoChain, string> = {
    ethereum: "ETH",
    solana: "SOL",
    tron: "TRX",
};

export const CRYPTO_CHAIN_ORDER: CryptoChain[] = ["ethereum", "solana", "tron"];

export const CRYPTO_CHAIN_DECIMALS: Record<CryptoChain, number> = {
    ethereum: 18,
    solana: 9,
    tron: 6,
};
