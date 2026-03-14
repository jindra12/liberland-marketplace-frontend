import * as React from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import * as Wallets from "./solanaWallets";

const network = "mainnet-beta";
const endpoint = clusterApiUrl(network);
const wallets = Object.values(Wallets).map(Wallet => new Wallet());

export const SolanaContext: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect={false}>
                <WalletModalProvider>
                    {props.children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
