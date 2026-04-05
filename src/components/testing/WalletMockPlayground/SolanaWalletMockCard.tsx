import * as React from "react";

import { createTransfer } from "@solana/pay";
import { PublicKey } from "@solana/web3.js";
import { BigNumber } from "bignumber.js";

import { SOLANA_WALLET_MOCK } from "./constants";
import type { SolanaMockState } from "./types";
import { createSolanaConnection, formatSolBalance, getSolanaProvider, readSolanaBalance } from "./utils";

const initialState: SolanaMockState = {
    status: "Not connected",
};

export const SolanaWalletMockCard: React.FunctionComponent = () => {
    const [state, setState] = React.useState<SolanaMockState>(initialState);

    const handleConnect = async () => {
        const provider = getSolanaProvider();
        const result = await provider.connect();
        const [senderBalance, recipientBalance] = await Promise.all([
            readSolanaBalance(SOLANA_WALLET_MOCK.sender),
            readSolanaBalance(SOLANA_WALLET_MOCK.recipient),
        ]);

        setState({
            address: result.publicKey.toBase58(),
            senderBalance: formatSolBalance(senderBalance),
            recipientBalance: formatSolBalance(recipientBalance),
            status: "Connected",
        });
    };

    const handleSend = async () => {
        const provider = getSolanaProvider();
        const connection = createSolanaConnection();
        const senderAddress = provider.publicKey?.toBase58() || SOLANA_WALLET_MOCK.sender;
        const transaction = await createTransfer(connection, new PublicKey(senderAddress), {
            recipient: new PublicKey(SOLANA_WALLET_MOCK.recipient),
            amount: new BigNumber(SOLANA_WALLET_MOCK.transferSol),
            memo: "Cypress Solana mock transfer",
        });
        const signature = await provider.sendTransaction(transaction, connection);
        const [senderBalance, recipientBalance] = await Promise.all([
            readSolanaBalance(SOLANA_WALLET_MOCK.sender),
            readSolanaBalance(SOLANA_WALLET_MOCK.recipient),
        ]);

        setState((current) => ({
            ...current,
            senderBalance: formatSolBalance(senderBalance),
            recipientBalance: formatSolBalance(recipientBalance),
            signature,
            status: "Transfer sent",
        }));
    };

    return (
        <section aria-label="Solana mock">
            <h2>Solana mock</h2>
            <p>@solana/pay</p>
            <p>
                Builds a real <code>@solana/pay</code> transfer transaction and sends it through a mocked Solana
                wallet provider backed by a local RPC shim.
            </p>
            <div>
                <button type="button" onClick={handleConnect}>
                    Connect Solana mock
                </button>
                <button type="button" onClick={handleSend}>
                    Send 0.25 SOL via @solana/pay
                </button>
            </div>
            <p data-testid="solana-status">Status: {state.status}</p>
            <p data-testid="solana-address">Address: {state.address || "n/a"}</p>
            <p data-testid="solana-signature">Signature: {state.signature || "n/a"}</p>
            <p data-testid="solana-sender-balance">Sender balance: {state.senderBalance || "0"} SOL</p>
            <p data-testid="solana-recipient-balance">Recipient balance: {state.recipientBalance || "0"} SOL</p>
        </section>
    );
};
