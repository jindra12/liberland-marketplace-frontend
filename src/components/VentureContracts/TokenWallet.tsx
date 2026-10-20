import * as React from "react";

import { Flex, Typography } from "antd";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";

import { GovernancePanel } from "./GovernancePanel";
import { TokenAccount } from "./TokenAccount";
import { TradingPanel } from "./TradingPanel";
import type { TokenWalletProps } from "./types";
import { VentureConnectButton } from "./VentureConnectButton";

export const TokenWallet: React.FunctionComponent<TokenWalletProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    const sections = {
        token: null,
        account:
            account && wallet ? (
                <TokenAccount deployment={props.deployment} account={account} wallet={wallet} />
            ) : (
                <Typography.Text>Connect your wallet to see balances and rewards.</Typography.Text>
            ),
        exchange: <TradingPanel {...props} account={account} wallet={wallet} section="exchange" />,
        liquidity: <TradingPanel {...props} account={account} wallet={wallet} section="liquidity" />,
        dao: <GovernancePanel {...props} account={account} wallet={wallet} />,
    };
    return (
        <Flex vertical gap={16}>
            <VentureConnectButton />
            {sections[props.section]}
        </Flex>
    );
};
