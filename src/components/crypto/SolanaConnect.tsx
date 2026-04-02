import * as React from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import Flex from "antd/es/flex";
import Grid from "antd/es/grid";

import { ConnectButtonProps } from "../../types";

import { SolanaButton } from "./SolanaButton";
import { SolanaCallback } from "./SolanaCallback";

export interface SolanaConnectProps extends ConnectButtonProps {
    payment?: boolean;
    label?: React.ReactNode;
    disabled?: boolean;
}

export const SolanaConnect: React.FunctionComponent<SolanaConnectProps> = (props) => {
    const [startedProcess, setStartedProcess] = React.useState(false);
    const { setVisible } = useWalletModal();
    const { select, disconnect, connected } = useWallet();
    const screens = Grid.useBreakpoint();
    const stackButtons = !screens.lg;

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
            <Flex vertical={stackButtons} wrap={!stackButtons} gap="15px" justify="center" align="center" flex={1}>
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
                    disabled={props.disabled}
                />
            </Flex>
        </>
    );
};
