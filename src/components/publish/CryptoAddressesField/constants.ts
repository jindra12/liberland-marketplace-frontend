import type { CryptoChain } from "../../../types";

export const CRYPTO_ADDRESS_CHAIN_OPTIONS: Array<{ label: string; value: CryptoChain }> = [
    {
        label: "Ethereum",
        value: "ethereum",
    },
    {
        label: "Solana",
        value: "solana",
    },
    {
        label: "Tron",
        value: "tron",
    },
];

export const CRYPTO_ADDRESS_CHAIN_LABELS: Record<CryptoChain, string> = {
    ethereum: "Ethereum",
    solana: "Solana",
    tron: "Tron",
};

