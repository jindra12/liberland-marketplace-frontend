import * as React from "react";
import { ThirdwebConnect } from "./ThirdwebConnect";
import { SolanaConnect } from "./SolanaConnect";
import { TronConnect } from "./TronConnect";
import { Chains, ConnectButtonProps } from "../../types";

export interface ChainConnectButtonProps extends ConnectButtonProps {
    chain: Chains;
}

export const ChainConnectButton: React.FunctionComponent<ChainConnectButtonProps> = (props) => {
    switch (props.chain) {
        case "Ethereum":
            return <ThirdwebConnect {...props} />;
        case "Solana":
            return <SolanaConnect {...props} />;
        case "Tron":
            return <TronConnect {...props} />;
    }
};