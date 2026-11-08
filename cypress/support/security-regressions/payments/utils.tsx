import React from "react";
import { mount } from "cypress/react";
import { TronWeb, type Types } from "tronweb";
import { TronPaymentButton } from "../../../../src/components/crypto/TronPaymentButton";
import { ThirdwebPayButton } from "../../../../src/components/crypto/ThirdwebPayButton";
import { SolanaPay } from "../../../../src/components/crypto/SolanaPay";
import { AntProvider } from "../../../../src/components/AntProvider";
import { OrderPaymentLockProvider } from "../../../../src/components/order/OrderPaymentLockContext";
import { connectTronWalletStub } from "../../walletStub/state";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { FormModel } from "../../../../src/types";

export const mountNativePaymentFixture = (
    chain: "ethereum" | "solana",
    saveProof: (hash: string) => Promise<void>,
    confirmed = true,
) => {
    if (chain === "ethereum") {
        cy.intercept<{ id: number; method: string } | { id: number; method: string }[]>(
            "POST",
            "https://1.rpc.thirdweb.com/**",
            (request) => {
                const reply = (body: { id: number; method: string }) => ({
                    jsonrpc: "2.0",
                    id: body.id,
                    result: confirmed
                        ? {
                              transactionHash: `0x${"ab".repeat(32)}`,
                              blockHash: `0x${"cd".repeat(32)}`,
                              blockNumber: "0x1",
                              transactionIndex: "0x0",
                              gasUsed: "0x5208",
                              cumulativeGasUsed: "0x5208",
                              effectiveGasPrice: "0x1",
                              status: "0x1",
                              type: "0x2",
                              logs: [],
                          }
                        : null,
                });
                request.reply(Array.isArray(request.body) ? request.body.map(reply) : reply(request.body));
            },
        );
    }
    const model: FormModel = {
        amount: 1n,
        orderId: `retry-order-${chain}`,
        recipient:
            chain === "ethereum" ? "0x1111111111111111111111111111111111111111" : "11111111111111111111111111111111",
    };
    return mount(
        <AntProvider>
            <QueryClientProvider client={new QueryClient()}>
                <OrderPaymentLockProvider>
                    {chain === "ethereum" ? (
                        <ThirdwebPayButton formModel={model} setTransactionId={saveProof} />
                    ) : (
                        <SolanaPay model={model} setTransactionId={saveProof} />
                    )}
                </OrderPaymentLockProvider>
            </QueryClientProvider>
        </AntProvider>,
    );
};

export const mountTronBroadcastFixture = (accepted: boolean, failSaving = false, confirmed = true) => {
    const client = new TronWeb({ fullHost: "https://tron-rpc.example" });
    const transaction: Types.Transaction = {
        txID: "ab".repeat(32),
        visible: false,
        raw_data_hex: "00",
        raw_data: {
            contract: [],
            ref_block_bytes: "0000",
            ref_block_hash: "00".repeat(8),
            expiration: Date.now() + 60000,
            timestamp: Date.now(),
        },
    };
    cy.stub(client.transactionBuilder, "sendTrx").resolves(transaction);
    cy.stub(client.transactionBuilder, "addUpdateData").resolves(transaction);
    const broadcast = cy.stub(client.trx, "sendRawTransaction").as("broadcast");
    broadcast.resolves({ result: accepted, txid: transaction.txID, code: accepted ? undefined : "SIGERROR" });
    const confirmation = cy.stub(client.trx, "getConfirmedTransaction");
    if (confirmed) {
        confirmation.resolves({ ...transaction, ret: [{ contractRet: "SUCCESS" }] });
    } else {
        confirmation.rejects(new Error("Transaction is not yet confirmed."));
    }
    const save = cy.stub().as("saveProof");
    if (failSaving) {
        save.onFirstCall().rejects(new Error("Proof persistence unavailable"));
        save.onSecondCall().resolves();
    } else {
        save.resolves();
    }
    cy.window().then((win) => {
        connectTronWalletStub("TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC");
        win.tronWeb = client;
    });
    mount(
        <AntProvider>
            <QueryClientProvider client={new QueryClient()}>
                <OrderPaymentLockProvider>
                    <TronPaymentButton
                        formModel={{ amount: 1n, orderId: "order", recipient: "TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC" }}
                        setTransactionId={save}
                    />
                </OrderPaymentLockProvider>
            </QueryClientProvider>
        </AntProvider>,
    );
};
