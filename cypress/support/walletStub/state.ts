import * as React from "react";

type ThirdwebWalletStubState = {
    account: {
        address: string;
    } | null;
    wallet: {
        id: string;
    } | null;
};

type SolanaWalletStubState = {
    connected: boolean;
    publicKey: string | null;
    walletName: string;
};

type TronWalletStubState = {
    address: string | null;
    connected: boolean;
    walletName: string;
};

export type WalletStubState = {
    thirdweb: ThirdwebWalletStubState;
    solana: SolanaWalletStubState;
    tron: TronWalletStubState;
};

type TronWebStub = {
    transactionBuilder: {
        sendTrx: (recipient: string, amount: number, fromAddress?: string | null) => Promise<{ signed: boolean }>;
    };
    trx: {
        sendRawTransaction: (signedTransaction: { signed: boolean }) => Promise<{ txid: string }>;
    };
};

const createDefaultState = (): WalletStubState => {
    return {
        thirdweb: {
            account: null,
            wallet: null,
        },
        solana: {
            connected: false,
            publicKey: null,
            walletName: "Phantom Stub",
        },
        tron: {
            address: null,
            connected: false,
            walletName: "TronLink Stub",
        },
    };
};

const listeners = new Set<() => void>();

let state = createDefaultState();

const notify = () => {
    Array.from(listeners).forEach((listener) => {
        listener();
    });
};

const syncTronWeb = () => {
    const tronWindow = window as Omit<Window, "tronWeb"> & { tronWeb?: TronWebStub };

    if (state.tron.connected && state.tron.address) {
        tronWindow.tronWeb = {
            transactionBuilder: {
                sendTrx: async () => ({
                    signed: true,
                }),
            },
            trx: {
                sendRawTransaction: async () => ({
                    txid: "tron-tx-stub",
                }),
            },
        };
        return;
    }

    tronWindow.tronWeb = undefined;
};

const updateState = (nextState: WalletStubState) => {
    state = nextState;
    syncTronWeb();
    notify();
};

const mergeState = (nextState: Partial<WalletStubState>): WalletStubState => {
    return {
        thirdweb: {
            account: nextState.thirdweb?.account ?? state.thirdweb.account,
            wallet: nextState.thirdweb?.wallet ?? state.thirdweb.wallet,
        },
        solana: {
            connected: nextState.solana?.connected ?? state.solana.connected,
            publicKey: nextState.solana?.publicKey ?? state.solana.publicKey,
            walletName: nextState.solana?.walletName ?? state.solana.walletName,
        },
        tron: {
            address: nextState.tron?.address ?? state.tron.address,
            connected: nextState.tron?.connected ?? state.tron.connected,
            walletName: nextState.tron?.walletName ?? state.tron.walletName,
        },
    };
};

export const resetWalletStubState = () => {
    state = createDefaultState();
    syncTronWeb();
    notify();
};

export const setWalletStubState = (nextState: Partial<WalletStubState>) => {
    updateState(mergeState(nextState));
};

export const connectThirdwebWalletStub = (address = "0xWalletStub111", walletId = "wallet-stub") => {
    updateState({
        ...state,
        thirdweb: {
            account: {
                address,
            },
            wallet: {
                id: walletId,
            },
        },
    });
};

export const connectSolanaWalletStub = (publicKey = "SoWalletStub111", walletName = "Phantom Stub") => {
    updateState({
        ...state,
        solana: {
            connected: true,
            publicKey,
            walletName,
        },
    });
};

export const disconnectSolanaWalletStub = () => {
    updateState({
        ...state,
        solana: {
            connected: false,
            publicKey: null,
            walletName: state.solana.walletName,
        },
    });
};

export const connectTronWalletStub = (address = "TWalletStub111", walletName = "TronLink Stub") => {
    updateState({
        ...state,
        tron: {
            address,
            connected: true,
            walletName,
        },
    });
};

export const disconnectTronWalletStub = () => {
    updateState({
        ...state,
        tron: {
            address: null,
            connected: false,
            walletName: state.tron.walletName,
        },
    });
};

export const useWalletStubState = () => {
    return React.useSyncExternalStore(
        (listener) => {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        () => state,
        () => state,
    );
};
