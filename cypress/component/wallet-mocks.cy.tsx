import * as React from "react";

import { mount } from "cypress/react";

import { EthereumWalletMockCard } from "../../src/components/testing/WalletMockPlayground/EthereumWalletMockCard";
import { SolanaWalletMockCard } from "../../src/components/testing/WalletMockPlayground/SolanaWalletMockCard";
import { TronWalletMockCard } from "../../src/components/testing/WalletMockPlayground/TronWalletMockCard";
import { EVM_WALLET_MOCK, SOLANA_RPC_URL, SOLANA_WALLET_MOCK, TRON_RPC_URL, TRON_WALLET_MOCK } from "../support/constants";
import { createRequestRecorder } from "../support/network";

describe("wallet mocks", () => {
    let network: ReturnType<typeof createRequestRecorder>;

    beforeEach(() => {
        network = createRequestRecorder();
        cy.intercept("POST", `${SOLANA_RPC_URL}/**`, (req) => {
            network.recordRequest(req);
        });
        cy.intercept("POST", `${TRON_RPC_URL}/**`, (req) => {
            network.recordRequest(req);
        });
        cy.request("POST", `${SOLANA_RPC_URL}/__admin/reset`);
        cy.request("POST", `${TRON_RPC_URL}/__admin/reset`);
        mount(
            <main>
                <EthereumWalletMockCard />
                <SolanaWalletMockCard />
                <TronWalletMockCard />
            </main>,
        );
    });

    it("sends native ETH through the MetaMask mock", () => {
        cy.contains("button", "Connect MetaMask mock").click();
        cy.get("[data-testid='evm-address']").should("contain.text", EVM_WALLET_MOCK.sender);

        cy.contains("button", "Send 0.1 ETH").click();
        cy.get("[data-testid='evm-tx']").should("not.contain.text", "n/a");
        cy.get("[data-testid='evm-recipient-balance']").should("contain.text", "0.6000");
    });

    it("sends native SOL through the Solana mock", () => {
        cy.contains("button", "Connect Solana mock").click();
        cy.get("[data-testid='solana-address']").should("contain.text", SOLANA_WALLET_MOCK.sender);

        cy.contains("button", "Send 0.25 SOL via @solana/pay").click();
        cy.get("[data-testid='solana-signature']").should("contain.text", "solana-mock-signature");
        cy.get("[data-testid='solana-recipient-balance']").should("contain.text", "0.7500");
        cy.then(() => {
            expect(network.requests.some((request) => request.url.startsWith(SOLANA_RPC_URL))).to.be.true;
        });
    });

    it("sends native TRON through the TronLink mock", () => {
        cy.contains("button", "Connect TronLink mock").click();
        cy.get("[data-testid='tron-address']").should("contain.text", TRON_WALLET_MOCK.sender);

        cy.contains("button", "Send 250000 SUN via tronweb").click();
        cy.get("[data-testid='tron-tx']").should("not.contain.text", "n/a");
        cy.get("[data-testid='tron-recipient-balance']").should("contain.text", "0.7500");
        cy.then(() => {
            expect(network.requests.some((request) => request.url.startsWith(TRON_RPC_URL))).to.be.true;
        });
    });
});
