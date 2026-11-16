import * as React from "react";

import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { Alert, Flex, Form, Typography } from "antd";

import { ventureTestWalletAddress, ventureTestWalletPhrase } from "./constants";
import type { DeploymentValues } from "./types";
import { getVentureChain } from "./utils";

export const TestDeploymentAlert: React.FunctionComponent = () => {
    const network = Form.useWatch<DeploymentValues["deploymentNetwork"]>("deploymentNetwork");
    if (network !== "localhost" && network !== "sepolia") {
        return null;
    }

    return (
        <Alert
            className="VentureContracts__test-wallet"
            type="warning"
            showIcon
            message={`${deploymentNetworks[network].label}: public test wallet`}
            description={
                <Flex vertical gap={12}>
                    <Typography.Text strong>
                        Everyone knows this phrase and can spend this wallet's funds. Never send real ETH or valuable
                        assets to it, on any network. Use a separate test-only MetaMask wallet or browser profile.
                    </Typography.Text>
                    <Flex vertical gap={4}>
                        <Typography.Text strong>Public 12-word recovery phrase</Typography.Text>
                        <Typography.Paragraph copyable className="VentureContracts__test-phrase">
                            {ventureTestWalletPhrase}
                        </Typography.Paragraph>
                        <Typography.Text>First account (Account 1)</Typography.Text>
                        <Typography.Text copyable code>{ventureTestWalletAddress}</Typography.Text>
                    </Flex>
                    <Typography.Text>
                        1. In a separate MetaMask wallet/profile, choose Import using Secret Recovery Phrase and enter
                        these 12 words in order. Do not reset or replace your everyday wallet. Add further accounts to
                        try different holders, then connect the test account here.
                    </Typography.Text>
                    {network === "sepolia" ? (
                        <Typography.Text>
                            2. Open MetaMask's Networks menu, enable Show test networks and choose Sepolia
                            (chain ID {deploymentNetworks.sepolia.chainId}, currency ETH).
                            This account is not pre-funded
                            on Sepolia: request test ETH from a Sepolia faucet before deploying. A fresh private test
                            wallet is safer because anyone can drain this public one.
                        </Typography.Text>
                    ) : (
                        <Flex vertical gap={4}>
                            <Typography.Text>
                                2. In MetaMask's Networks menu, choose Add a custom network and enter:
                            </Typography.Text>
                            <Typography.Text>Network name: Nswap test fork</Typography.Text>
                            <Typography.Text copyable>
                                RPC URL: {getVentureChain(deploymentNetworks.localhost.chainId).rpc}
                            </Typography.Text>
                            <Typography.Text>
                                Chain ID: {deploymentNetworks.localhost.chainId} · Currency symbol: ETH
                            </Typography.Text>
                            <Typography.Text>
                                Select that network, then connect here. The running Hardhat fork supplies fake ETH to
                                its test accounts. The hosted fork must be online; resetting it removes test deployments
                                and balances. This is not Ethereum mainnet.
                            </Typography.Text>
                        </Flex>
                    )}
                    <Typography.Link
                        href="https://support.metamask.io/configure/networks/how-to-view-testnets-in-metamask"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MetaMask network setup guide
                    </Typography.Link>
                </Flex>
            }
        />
    );
};
