import * as React from "react";

import { Flex, Typography } from "antd";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";

import { DeploymentFlow } from "./DeploymentFlow";
import type { DeploymentWalletProps } from "./types";
import { VentureConnectButton } from "./VentureConnectButton";

export const DeploymentWallet: React.FunctionComponent<DeploymentWalletProps> = (props) => {
    const account = useActiveAccount();
    const wallet = useActiveWallet();
    return (
        <Flex vertical gap={16}>
            <Flex align="center" justify="space-between" gap={12} wrap>
                <Typography.Title level={4}>Deploy on Ethereum</Typography.Title>
                <VentureConnectButton />
            </Flex>
            {account && wallet ? (
                <DeploymentFlow
                    ventureName={props.ventureName}
                    deploymentKey={props.deploymentKey}
                    ventureId={props.ventureId}
                    serverURL={props.serverURL}
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
