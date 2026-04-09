import * as React from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Flex from "antd/es/flex";
import Grid from "antd/es/grid";

import { ConnectButtonProps } from "../../types";
import type { PaymentWalletSelection } from "../order/types";

import { SolanaButton } from "./SolanaButton";
import { SolanaCallback } from "./SolanaCallback";

export interface SolanaConnectProps extends ConnectButtonProps {
    payment?: boolean;
    label?: React.ReactNode;
    disabled?: boolean;
    inline?: boolean;
    preferredWallet?: PaymentWalletSelection;
}

export const SolanaConnect: React.FunctionComponent<SolanaConnectProps> = (props) => {
    const [startedProcess, setStartedProcess] = React.useState(false);
    const { setVisible } = useWalletModal();
    const { select, disconnect, connected, publicKey, wallet } = useWallet();
    const screens = Grid.useBreakpoint();
    const stackButtons = !screens.lg;
    const publicKeyValue = publicKey?.toBase58();

    React.useEffect(() => {
        if (!props.payment || !connected || !publicKeyValue || !wallet?.adapter.name) {
            return;
        }

        if (
            props.preferredWallet &&
            (props.preferredWallet.address !== publicKeyValue || props.preferredWallet.provider !== wallet.adapter.name)
        ) {
            return;
        }

        props.selectWallet(publicKeyValue);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        connected,
        publicKeyValue,
        wallet?.adapter.name,
        props.payment,
        props.preferredWallet?.address,
        props.preferredWallet?.provider,
    ]);

    const button = (
        <SolanaButton
            className="CryptoPaymentGroup__connectButton"
            onSelect={async () => {
                if (connected) {
                    await disconnect();
                }
                setStartedProcess(true);
                select(null);
                setVisible(true);
            }}
            label={props.inline ? props.label || "Solana" : props.label || "Select wallet"}
            payment={props.payment}
            disabled={props.disabled}
        />
    );

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
            {props.inline ? (
                button
            ) : (
                <Flex vertical={stackButtons} wrap={!stackButtons} gap="15px" justify="center" align="center" flex={1}>
                    {button}
                </Flex>
            )}
        </>
    );
};
