import * as React from "react";

import {
    connectSolanaWalletStub,
    disconnectSolanaWalletStub,
    useWalletStubState,
} from "./state";

type WalletAdapter = {
    name: string;
};

type SolanaWallet = {
    adapter: WalletAdapter;
    readyState: "Installed";
};

type PublicKeyStub = {
    toBase58: () => string;
};

const toPublicKeyStub = (value: string): PublicKeyStub => {
    return {
        toBase58: () => value,
    };
};

export const ConnectionProvider: React.FunctionComponent<React.PropsWithChildren<{ endpoint: string }>> = (
    props,
) => {
    return <>{props.children}</>;
};

export const WalletProvider: React.FunctionComponent<
    React.PropsWithChildren<{ wallets: Array<{ name?: string }>; autoConnect?: boolean }>
> = (props) => {
    return <>{props.children}</>;
};

export const useWallet = () => {
    const walletState = useWalletStubState();

    const connect = async () => {
        connectSolanaWalletStub();
    };

    const disconnect = async () => {
        disconnectSolanaWalletStub();
    };

    const wallet: SolanaWallet = {
        adapter: {
            name: walletState.solana.walletName,
        },
        readyState: "Installed",
    };

    return {
        connected: walletState.solana.connected,
        connecting: false,
        connect,
        disconnect,
        publicKey: walletState.solana.connected && walletState.solana.publicKey ? toPublicKeyStub(walletState.solana.publicKey) : undefined,
        select: (_wallet: null) => undefined,
        sendTransaction: async () => "solana-tx-stub",
        wallet,
    };
};
