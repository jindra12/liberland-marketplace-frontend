import * as React from "react";

import { Chains, ConnectButtonProps } from "../../types";

import { SolanaConnect } from "./SolanaConnect";
import { ThirdwebConnect } from "./ThirdwebConnect";
import { TronConnect } from "./TronConnect";

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
