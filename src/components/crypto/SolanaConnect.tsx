import * as React from "react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButtonProps } from "../../types";
import { SolanaCallback } from "./SolanaCallback";
import { SolanaButton } from "./SolanaButton";

export interface SolanaConnectProps extends ConnectButtonProps {
    payment?: boolean;
    label?: React.ReactNode;
}

export const SolanaConnect: React.FunctionComponent<SolanaConnectProps> = (props) => {
    const [startedProcess, setStartedProcess] = React.useState(false);
    const { setVisible } = useWalletModal();
    const { select, disconnect, connected } = useWallet();

    return (
        <>
            {startedProcess && (
                <SolanaCallback
                    selectWallet={(wallet) => {
                        props.selectWallet(wallet);
                        setStartedProcess(false);
                    }}
                />
            )}
            <SolanaButton
                onSelect={async () => {
                    if (connected) {
                        await disconnect();
                    }
                    setStartedProcess(true);
                    select(null);
                    setVisible(true);
                }}
                label={props.label}
                payment={props.payment}
            />
        </>
    );
};
