import * as React from "react";
import Flex from "antd/es/flex";
import Grid from "antd/es/grid";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { ConnectButtonProps } from "../../types";
import { SolanaCallback } from "./SolanaCallback";
import { SolanaButton } from "./SolanaButton";

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
