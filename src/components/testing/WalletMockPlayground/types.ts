import type { Connection, Transaction } from "@solana/web3.js";

export type EthereumMockState = {
    address?: string;
    recipientBalance?: string;
    senderBalance?: string;
    status: string;
    txHash?: string;
};

export type SolanaMockState = {
    address?: string;
    recipientBalance?: string;
    senderBalance?: string;
    signature?: string;
    status: string;
};

export type TronMockState = {
    address?: string;
    recipientBalance?: string;
    senderBalance?: string;
    status: string;
    txId?: string;
};

export type MockEthereumProvider = {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

export type MockSolanaProvider = {
    connect: () => Promise<{ publicKey: { toBase58: () => string } }>;
    publicKey?: { toBase58: () => string };
    sendTransaction: (transaction: Transaction, connection: Connection) => Promise<string>;
};

export type MockTronLink = {
    request: (args: { method: string }) => Promise<{ address?: string; code?: number; message?: string } | null>;
    tronWeb: {
        defaultAddress: {
            base58: string;
            hex: string;
        };
        trx: {
            sign: <T>(transaction: T) => Promise<T>;
        };
    };
};
