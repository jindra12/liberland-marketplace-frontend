import * as React from "react";

export const WalletModalProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return <>{props.children}</>;
};

export const useWalletModal = () => {
    return {
        setVisible: (_value: boolean) => undefined,
    };
};

