import * as React from "react";

import { SOLANA_RPC_URL, TRON_RPC_URL } from "./constants";
import { EthereumWalletMockCard } from "./EthereumWalletMockCard";
import { SolanaWalletMockCard } from "./SolanaWalletMockCard";
import { TronWalletMockCard } from "./TronWalletMockCard";

export const WalletMockPlaygroundPage: React.FunctionComponent = () => {
    return (
        <main className="WalletMockPlayground">
            <h1>Playwright Wallet Mock Playground</h1>
            <p>
                This page exists for end-to-end tests. It exercises Playwright-injected wallet mocks together with the
                real libraries already used by the app.
            </p>
            <p>Local RPC targets</p>
            <p>{`Solana RPC: ${SOLANA_RPC_URL} | Tron RPC: ${TRON_RPC_URL}`}</p>
            <div>
                <EthereumWalletMockCard />
                <SolanaWalletMockCard />
                <TronWalletMockCard />
            </div>
        </main>
    );
};
