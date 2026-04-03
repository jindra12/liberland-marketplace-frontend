import * as React from "react";

import { TRON_WALLET_MOCK } from "./constants";
import type { TronMockState } from "./types";
import { createTronWebClient, formatTronBalance, getTronLink, readTronBalance } from "./utils";

const initialState: TronMockState = {
    status: "Not connected",
};

export const TronWalletMockCard: React.FunctionComponent = () => {
    const [state, setState] = React.useState<TronMockState>(initialState);

    const handleConnect = async () => {
        const tronLink = getTronLink();
        await tronLink.request({ method: "tron_requestAccounts" });
        const [senderBalance, recipientBalance] = await Promise.all([
            readTronBalance(TRON_WALLET_MOCK.sender),
            readTronBalance(TRON_WALLET_MOCK.recipient),
        ]);

        setState({
            address: tronLink.tronWeb.defaultAddress.base58,
            senderBalance: formatTronBalance(senderBalance),
            recipientBalance: formatTronBalance(recipientBalance),
            status: "Connected",
        });
    };

    const handleSend = async () => {
        const tronLink = getTronLink();
        const tronWeb = createTronWebClient();
        tronWeb.setAddress(TRON_WALLET_MOCK.sender);
        const unsignedTransaction = await tronWeb.transactionBuilder.sendTrx(
            TRON_WALLET_MOCK.recipient,
            TRON_WALLET_MOCK.transferSun,
            TRON_WALLET_MOCK.sender,
        );
        const signedTransaction = (await tronLink.tronWeb.trx.sign(unsignedTransaction)) as
            typeof unsignedTransaction & {
                signature: string[];
            };
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction);
        const [senderBalance, recipientBalance] = await Promise.all([
            readTronBalance(TRON_WALLET_MOCK.sender),
            readTronBalance(TRON_WALLET_MOCK.recipient),
        ]);

        setState((current) => ({
            ...current,
            senderBalance: formatTronBalance(senderBalance),
            recipientBalance: formatTronBalance(recipientBalance),
            status: "Transfer sent",
            txId: result.txid,
        }));
    };

    return (
        <section aria-label="TronLink / TRON mock">
            <h2>TronLink / TRON mock</h2>
            <p>tronweb</p>
            <p>
                Uses the real <code>tronweb</code> client against a local mock full node, with wallet approval and
                signing provided by a mocked TronLink interface.
            </p>
            <div>
                <button type="button" onClick={handleConnect}>
                    Connect TronLink mock
                </button>
                <button type="button" onClick={handleSend}>
                    Send 250000 SUN via tronweb
                </button>
            </div>
            <p data-testid="tron-status">Status: {state.status}</p>
            <p data-testid="tron-address">Address: {state.address || "n/a"}</p>
            <p data-testid="tron-tx">Latest tx: {state.txId || "n/a"}</p>
            <p data-testid="tron-sender-balance">Sender balance: {state.senderBalance || "0"} TRX</p>
            <p data-testid="tron-recipient-balance">Recipient balance: {state.recipientBalance || "0"} TRX</p>
        </section>
    );
};
