import * as React from "react";

import { EVM_WALLET_MOCK } from "./constants";
import type { EthereumMockState } from "./types";
import { formatEtherBalance, getEthereumProvider, readEthereumBalance } from "./utils";

const initialState: EthereumMockState = {
    status: "Not connected",
};

export const EthereumWalletMockCard: React.FunctionComponent = () => {
    const [state, setState] = React.useState<EthereumMockState>(initialState);

    const handleConnect = async () => {
        const provider = getEthereumProvider();
        const accounts = (await provider.request({ method: "eth_requestAccounts" })) as string[];
        const [senderBalance, recipientBalance] = await Promise.all([
            readEthereumBalance(provider, EVM_WALLET_MOCK.sender),
            readEthereumBalance(provider, EVM_WALLET_MOCK.recipient),
        ]);

        setState({
            address: accounts[0],
            senderBalance,
            recipientBalance,
            status: "Connected",
        });
    };

    const handleSend = async () => {
        const provider = getEthereumProvider();
        const txHash = (await provider.request({
            method: "eth_sendTransaction",
            params: [
                {
                    from: EVM_WALLET_MOCK.sender,
                    to: EVM_WALLET_MOCK.recipient,
                    value: EVM_WALLET_MOCK.transferValueWei,
                },
            ],
        })) as string;
        const [senderBalance, recipientBalance] = await Promise.all([
            readEthereumBalance(provider, EVM_WALLET_MOCK.sender),
            readEthereumBalance(provider, EVM_WALLET_MOCK.recipient),
        ]);

        setState((current) => ({
            ...current,
            senderBalance,
            recipientBalance,
            status: "Transfer sent",
            txHash,
        }));
    };

    return (
        <section aria-label="MetaMask / EVM mock">
            <h2>MetaMask / EVM mock</h2>
            <p>window.ethereum</p>
            <p>Uses a Cypress-injected EIP-1193 provider with native ETH balance updates.</p>
            <div>
                <button type="button" onClick={handleConnect}>
                    Connect MetaMask mock
                </button>
                <button type="button" onClick={handleSend}>
                    Send 0.1 ETH
                </button>
            </div>
            <p data-testid="evm-status">Status: {state.status}</p>
            <p data-testid="evm-address">Address: {state.address || "n/a"}</p>
            <p data-testid="evm-tx">Latest tx: {state.txHash || "n/a"}</p>
            <p data-testid="evm-sender-balance">Sender balance: {formatEtherBalance(state.senderBalance)} ETH</p>
            <p data-testid="evm-recipient-balance">
                Recipient balance: {formatEtherBalance(state.recipientBalance)} ETH
            </p>
        </section>
    );
};
