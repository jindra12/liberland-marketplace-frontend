import { Connection, PublicKey } from "@solana/web3.js";
import { TronWeb } from "tronweb";

import type { MockEthereumProvider, MockSolanaProvider, MockTronLink } from "./types";

import { SOLANA_RPC_URL, TRON_RPC_URL } from "./constants";

export const getEthereumProvider = (): MockEthereumProvider => {
    const provider = (window as Window & { ethereum?: MockEthereumProvider }).ethereum;
    if (!provider) {
        throw new Error("window.ethereum mock is not installed");
    }

    return provider;
};

export const getSolanaProvider = (): MockSolanaProvider => {
    const provider =
        (window as Window & { phantom?: { solana?: MockSolanaProvider }; solana?: MockSolanaProvider; solflare?: MockSolanaProvider }).solflare ||
        (window as Window & { phantom?: { solana?: MockSolanaProvider }; solana?: MockSolanaProvider; solflare?: MockSolanaProvider }).solana ||
        (window as Window & { phantom?: { solana?: MockSolanaProvider } }).phantom?.solana;
    if (!provider) {
        throw new Error("No Solana wallet mock is installed");
    }

    return provider;
};

export const getTronLink = (): MockTronLink => {
    const tronLink = (window as Window & { tronLink?: MockTronLink }).tronLink;
    if (!tronLink) {
        throw new Error("window.tronLink mock is not installed");
    }

    return tronLink;
};

export const createSolanaConnection = (): Connection => {
    return new Connection(SOLANA_RPC_URL, "confirmed");
};

export const createTronWebClient = (): TronWeb => {
    return new TronWeb({ fullHost: TRON_RPC_URL });
};

export const formatEtherBalance = (wei?: string): string => {
    if (!wei) {
        return "0";
    }

    return (Number(wei) / 1_000_000_000_000_000_000).toFixed(4);
};

export const formatSolBalance = (lamports?: number): string => {
    if (lamports === undefined) {
        return "0";
    }

    return (lamports / 1_000_000_000).toFixed(4);
};

export const formatTronBalance = (sun?: number): string => {
    if (sun === undefined) {
        return "0";
    }

    return (sun / 1_000_000).toFixed(4);
};

export const readEthereumBalance = async (provider: MockEthereumProvider, address: string): Promise<string> => {
    const result = await provider.request({
        method: "eth_getBalance",
        params: [address],
    });

    return BigInt(String(result)).toString();
};

export const readSolanaBalance = async (address: string): Promise<number> => {
    const connection = createSolanaConnection();
    return connection.getBalance(new PublicKey(address));
};

export const readTronBalance = async (address: string): Promise<number> => {
    const tronWeb = createTronWebClient();
    return tronWeb.trx.getBalance(address);
};
