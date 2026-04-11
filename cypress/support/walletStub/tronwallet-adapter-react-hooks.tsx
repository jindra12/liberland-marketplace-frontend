import * as React from "react";

import { connectTronWalletStub, disconnectTronWalletStub, useWalletStubState } from "./state";

type TronWalletAdapter = {
    name: string;
};

export const WalletProvider: React.FunctionComponent<
    React.PropsWithChildren<{ adapters: Array<{ name?: string }>; onError?: (error: Error) => void; autoConnect?: boolean }>
> = (props) => {
    return <>{props.children}</>;
};

export const useWallet = () => {
    const walletState = useWalletStubState();

    const signTransaction = async <T,>(transaction: T): Promise<T> => {
        return transaction;
    };

    return {
        address: walletState.tron.address,
        connected: walletState.tron.connected,
        signTransaction,
        wallet: {
            adapter: {
                name: walletState.tron.walletName,
            } satisfies TronWalletAdapter,
        },
    };
};

export const connectTronWallet = () => {
    connectTronWalletStub();
};

export const disconnectTronWallet = () => {
    disconnectTronWalletStub();
};
