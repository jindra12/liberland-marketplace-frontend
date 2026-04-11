import * as React from "react";

import {
    connectThirdwebWalletStub,
    type WalletStubState,
    useWalletStubState,
} from "./state";

type ConnectButtonProps = {
    connectButton?: {
        className?: string;
        label?: React.ReactNode;
    };
    detailsButton?: {
        className?: string;
        label?: React.ReactNode;
    };
};

type UseConnectModalResult = {
    connect: () => Promise<{
        getAccount: () => {
            address: string;
        } | null;
        id: string;
    }>;
    isConnecting: boolean;
};

export const ThirdwebProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return <>{props.children}</>;
};

export const ConnectButton: React.FunctionComponent<ConnectButtonProps> = (props) => {
    const walletState = useWalletStubState();
    const isConnected = Boolean(walletState.thirdweb.account);

    const handleClick = () => {
        if (!isConnected) {
            connectThirdwebWalletStub();
        }
    };

    const label = isConnected
        ? props.detailsButton?.label ?? props.connectButton?.label ?? "Connected"
        : props.connectButton?.label ?? "Connect";
    const className = isConnected ? props.detailsButton?.className : props.connectButton?.className;

    return (
        <button type="button" className={className} onClick={handleClick}>
            {label}
        </button>
    );
};

export const useActiveAccount = (): WalletStubState["thirdweb"]["account"] => {
    return useWalletStubState().thirdweb.account;
};

export const useActiveWallet = (): WalletStubState["thirdweb"]["wallet"] => {
    return useWalletStubState().thirdweb.wallet;
};

export const useSendAndConfirmTransaction = () => {
    return {
        mutateAsync: async () => {
            return { transactionHash: "0xwalletstub" };
        },
        isPending: false,
        isError: false,
        isSuccess: false,
    };
};

export const useConnectModal = (): UseConnectModalResult => {
    return {
        connect: async () => {
            connectThirdwebWalletStub();

            return {
                getAccount: () => {
                    return {
                        address: "0xWalletStub111",
                    };
                },
                id: "wallet-stub",
            };
        },
        isConnecting: false,
    };
};
