import * as React from "react";

import { Button } from "antd";
import { createThirdwebClient } from "thirdweb";
import { mainnet } from "thirdweb/chains";
import { useConnectModal } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { thirdwebWallets } from "../../../constants";
import type { ProfileWalletSelection } from "../types";

const client = createThirdwebClient({
    clientId: process.env.REACT_APP_THIRDWEB!,
});

const wallets = thirdwebWallets.map((wallet) => createWallet(wallet));

type EthereumWalletSelectButtonProps = {
    disabled?: boolean;
    inline?: boolean;
    label?: React.ReactNode;
    onWalletSelected: (wallet: ProfileWalletSelection) => void;
};

export const EthereumWalletSelectButton: React.FunctionComponent<EthereumWalletSelectButtonProps> = (props) => {
    const { connect, isConnecting } = useConnectModal();

    const handleSelect = async () => {
        try {
            const wallet = await connect({
                chain: mainnet,
                client,
                wallets,
            });
            const account = wallet.getAccount();

            if (!account?.address) {
                return;
            }

            props.onWalletSelected({
                address: account.address,
                provider: wallet.id,
            });
        } catch (error) {
            if (error) {
                console.error("Failed to select Ethereum wallet", error);
            }
        }
    };

    return (
        <Button disabled={props.disabled || isConnecting} loading={isConnecting} onClick={handleSelect}>
            {props.label || "Thirdweb"}
        </Button>
    );
};
