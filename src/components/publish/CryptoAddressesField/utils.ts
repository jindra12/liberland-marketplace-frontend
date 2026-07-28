import { PublicKey } from "@solana/web3.js";
import TronWeb from "tronweb";

import type { CryptoChain } from "../../../types";

import { CRYPTO_ADDRESS_CHAIN_LABELS } from "./constants";
import type { CryptoAddressesFormValue } from "./types";

const isEthereumAddress = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value);

const isSolanaAddress = (value: string): boolean => {
    try {
        return new PublicKey(value).toBase58() === value;
    } catch {
        return false;
    }
};

const isTronAddress = (value: string): boolean => TronWeb.utils.address.isAddress(value);

const isCryptoChain = (value: string | null | undefined): value is CryptoChain =>
    value === "ethereum" || value === "solana" || value === "tron";

export const buildCryptoAddressesInput = (value?: CryptoAddressesFormValue | null) => {
    const chain = value?.chain;
    const address = typeof value?.address === "string" ? value.address.trim() : "";

    if (!chain && !address) {
        return undefined;
    }

    return {
        chain,
        address,
    };
};

export const validateCryptoAddress = (
    chain: string | null | undefined,
    address: string | null | undefined,
): true | string => {
    const normalizedAddress = typeof address === "string" ? address.trim() : "";

    if (!normalizedAddress && !chain) {
        return true;
    }

    if (normalizedAddress && !isCryptoChain(chain)) {
        return "Select a wallet chain first.";
    }

    if (!normalizedAddress && isCryptoChain(chain)) {
        return "Address is required when chain is selected.";
    }

    if (!isCryptoChain(chain)) {
        return "Invalid wallet chain.";
    }

    if (chain === "ethereum") {
        return isEthereumAddress(normalizedAddress)
            ? true
            : `Please enter a valid ${CRYPTO_ADDRESS_CHAIN_LABELS[chain]} address.`;
    }

    if (chain === "solana") {
        return isSolanaAddress(normalizedAddress)
            ? true
            : `Please enter a valid ${CRYPTO_ADDRESS_CHAIN_LABELS[chain]} address.`;
    }

    return isTronAddress(normalizedAddress)
        ? true
        : `Please enter a valid ${CRYPTO_ADDRESS_CHAIN_LABELS[chain]} address.`;
};

