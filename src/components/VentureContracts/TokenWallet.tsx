import * as React from "react";

import { Flex } from "antd";
import { ConnectButton, useActiveAccount, useActiveWallet } from "thirdweb/react";

import { ventureWalletClient } from "./constants";
import { TokenAccount } from "./TokenAccount";
import type { TokenWalletProps } from "./types";

export const TokenWallet: React.FunctionComponent<TokenWalletProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    return (
        <Flex vertical gap={16}>
            <ConnectButton client={ventureWalletClient} />
            {account && wallet && <TokenAccount deployment={props.deployment} account={account} wallet={wallet} />}
        </Flex>
    );
};
