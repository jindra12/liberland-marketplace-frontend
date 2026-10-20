import * as React from "react";

import { Avatar, Button, Flex } from "antd";
import { ConnectButton, useActiveAccount, useConnectModal } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { thirdwebWallets } from "../../constants";

import { ventureWalletClient } from "./constants";

export const VentureConnectButton: React.FunctionComponent = () => {
    const account = useActiveAccount();
    const modal = useConnectModal();

    return (
        <Flex align="center">
            {account ? (
                <ConnectButton
                    client={ventureWalletClient}
                    detailsButton={{
                        className: "ThirdwebPay__connect VentureContracts__connect ant-btn ant-btn-primary",
                    }}
                />
            ) : (
                <Button
                    type="primary"
                    className="ThirdwebPay__connect VentureContracts__connect"
                    loading={modal.isConnecting}
                    onClick={async () => {
                        await modal.connect({
                            client: ventureWalletClient,
                            wallets: thirdwebWallets.map((wallet) => createWallet(wallet)),
                        });
                    }}
                    icon={<Avatar src="/ethereum.svg" size={24} shape="square" />}
                >
                    Connect
                </Button>
            )}
        </Flex>
    );
};
