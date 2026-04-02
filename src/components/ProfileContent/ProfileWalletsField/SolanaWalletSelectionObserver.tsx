import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import type { ProfileWalletSelection } from "../types";

type SolanaWalletSelectionObserverProps = {
    active: boolean;
    onWalletSelected: (wallet: ProfileWalletSelection) => void;
};

export const SolanaWalletSelectionObserver: React.FunctionComponent<SolanaWalletSelectionObserverProps> = (props) => {
    const { connect, connected, connecting, publicKey, wallet } = useWallet();

    React.useEffect(() => {
        if (!props.active || !wallet) {
            return;
        }

        if (!connected && !connecting && wallet.readyState === "Installed") {
            const connectWallet = async () => {
                try {
                    await connect();
                } catch (error) {
                    console.error("Failed to connect Solana wallet", error);
                }
            };

            connectWallet();
            return;
        }

        if (connected && publicKey) {
            props.onWalletSelected({
                address: publicKey.toBase58(),
                provider: wallet.adapter.name,
            });
        }
    }, [connect, connected, connecting, props.active, props.onWalletSelected, publicKey, wallet]);

    return null;
};
