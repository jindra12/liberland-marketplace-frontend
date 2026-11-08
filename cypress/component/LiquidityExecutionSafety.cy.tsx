import { V4PositionClient } from "@liberland/marketplace-contracts";
import { Wallet } from "ethers";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import { createWallet, privateKeyToAccount } from "thirdweb/wallets";
import { submitVentureLiquidity } from "../../src/components/VentureContracts/liquidityUtils";
import { ventureWalletClient } from "../../src/components/VentureContracts/constants";
import { savedDeployment } from "../support/ventureContracts";
import { venturePool } from "../support/ventureMarket";

describe("Liquidity execution safety", { retries: 0 }, () => {
    ["normal", "unprotected", "expired"].forEach((scenario) => {
        it(`handles ${scenario} withdrawal limits before requesting a transaction`, () => {
            const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
            const account = privateKeyToAccount({ client: ventureWalletClient, privateKey });
            const wallet = createWallet("io.metamask");
            const startedAt = Date.UTC(2026, 10, 8);
            cy.clock(startedAt, ["Date"]);
            cy.stub(wallet, "switchChain").resolves();
            cy.stub(ethers6Adapter.signer, "toEthers").resolves(new Wallet(privateKey));
            cy.clock().then((clock) => {
                cy.stub(V4PositionClient.prototype, "verifyPosition").callsFake(async () => {
                    if (scenario === "expired") {
                        clock.setSystemTime(startedAt + 25 * 60 * 1000);
                    }
                    return 100n;
                });
            });
            const withdraw = cy.stub(V4PositionClient.prototype, "decreaseLiquidity").resolves("0xwithdrawn");
            cy.then(async () => {
                const request = submitVentureLiquidity(
                    { deployment: savedDeployment, pool: venturePool, account, wallet },
                    {
                        action: "withdraw",
                        tokenId: "42",
                        liquidity: "50",
                        minimumEth: scenario === "unprotected" ? "0" : "0.01",
                        minimumTokens: "0",
                        ethAmount: "",
                        tokenAmount: "",
                        slippage: 0.5,
                    },
                );
                if (scenario === "normal") {
                    expect(await request).to.equal("0xwithdrawn");
                    expect(withdraw.firstCall.args[0]).to.include({
                        liquidity: 50n,
                        amount0Limit: 10n ** 16n,
                        amount1Limit: 0n,
                        deadline: BigInt(startedAt / 1000 + 1200),
                    });
                } else {
                    try {
                        await request;
                        throw new Error("An unsafe withdrawal was submitted.");
                    } catch (error) {
                        if (!(error instanceof Error)) {
                            throw error;
                        }
                        expect(error.message).to.match(scenario === "expired" ? /expired/i : /minimum/i);
                    }
                    expect(withdraw.callCount).to.equal(0);
                }
            });
        });
    });
    it("does not submit an expired mint after slow wallet approvals", () => {
        const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
        const account = privateKeyToAccount({ client: ventureWalletClient, privateKey });
        const wallet = createWallet("io.metamask");
        const startedAt = Date.UTC(2026, 10, 4);
        cy.clock(startedAt, ["Date"]);
        cy.stub(wallet, "switchChain").resolves();
        cy.stub(ethers6Adapter.signer, "toEthers").resolves(new Wallet(privateKey));
        cy.stub(V4PositionClient.prototype, "quoteFullRange").resolves({
            pool: venturePool,
            tickLower: -887220,
            tickUpper: 887220,
            liquidity: 100n,
            amount0Maximum: 100n,
            amount1Maximum: 100n,
        });
        cy.clock().then((clock) => {
            cy.stub(V4PositionClient.prototype, "approveCurrency").callsFake(async () => {
                // Advance wall-clock time only; no timers, wallet, RPC or chain writes run.
                clock.setSystemTime(startedAt + 25 * 60 * 1000);
            });
        });
        const mint = cy.stub(V4PositionClient.prototype, "mintPosition").resolves({
            tokenId: 42n,
            transactionHash: `0x${"a".repeat(64)}`,
        });
        cy.then(async () => {
            try {
                await submitVentureLiquidity(
                    { deployment: savedDeployment, pool: venturePool, account, wallet },
                    {
                        action: "mint",
                        ethAmount: "0.1",
                        tokenAmount: "200",
                        slippage: 0.5,
                        tokenId: "",
                        liquidity: "",
                        minimumEth: "",
                        minimumTokens: "",
                    },
                );
                throw new Error("Expected the expired approval to prevent minting.");
            } catch (error) {
                if (!(error instanceof Error)) {
                    throw error;
                }
                expect(error.message).to.contain("approval window expired");
            }
            expect(mint.callCount).to.equal(0);
        });
    });
});
