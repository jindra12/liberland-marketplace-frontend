import * as React from "react";

import { useWallet } from "@tronweb3/tronwallet-adapter-react-hooks";

import type { ProfileWalletSelection } from "../types";

type TronWalletSelectionObserverProps = {
    active: boolean;
    onWalletSelected: (wallet: ProfileWalletSelection) => void;
};

export const TronWalletSelectionObserver: React.FunctionComponent<TronWalletSelectionObserverProps> = (props) => {
    const { address, connected, wallet } = useWallet();

    React.useEffect(() => {
        if (!props.active || !address || !connected || !wallet) {
            return;
        }

        props.onWalletSelected({
            address,
            provider: wallet.adapter.name,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [address, connected, props.active, props.onWalletSelected, wallet]);

    return null;
};
