import * as React from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButtonProps } from "../../types";

export const SolanaCallback: React.FunctionComponent<ConnectButtonProps> = (props) => {
    const { publicKey, connected, connect, wallet } = useWallet();
    React.useEffect(() => {
        (async () => {
            if (wallet?.readyState === "Installed" && !connected) {
                await connect();
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [wallet?.readyState, connected]);
    React.useEffect(() => {
        if (publicKey && connected) {
            props.selectWallet(publicKey.toBase58());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [publicKey]);
    return null;
};
