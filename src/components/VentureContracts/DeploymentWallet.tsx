import * as React from "react";

import { Flex, Typography } from "antd";
import { ConnectButton, useActiveAccount, useActiveWallet } from "thirdweb/react";

import { ventureWalletClient } from "./constants";
import { DeploymentFlow } from "./DeploymentFlow";
import type { DeploymentWalletProps } from "./types";

export const DeploymentWallet: React.FunctionComponent<DeploymentWalletProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    return (
        <Flex vertical gap={16}>
            <Flex align="center" justify="space-between" gap={12} wrap>
                <Typography.Title level={4}>Deploy on Ethereum</Typography.Title>
                <ConnectButton client={ventureWalletClient} />
            </Flex>
            {account && wallet ? (
                <DeploymentFlow
                    ventureName={props.ventureName}
                    account={account}
                    wallet={wallet}
                    onSave={props.onSave}
                />
            ) : (
                <Typography.Text type="secondary">
                    Connect a wallet to configure and deploy your Venture token.
                </Typography.Text>
            )}
        </Flex>
    );
};
