import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";
import { createWallet, privateKeyToAccount } from "thirdweb/wallets";
import { DeploymentFlow } from "../../src/components/VentureContracts/DeploymentFlow";
import type { DeploymentRecovery } from "../../src/components/VentureContracts/types";
import { ventureWalletClient } from "../../src/components/VentureContracts/constants";
import { mountVentureMarket } from "../support/ventureMarket";
import { deploymentManifest } from "../support/ventureContracts";
import { screenshotStep } from "../support/component-tests/directBasic";
import { writeDeploymentRecovery } from "../../src/components/VentureContracts/recoveryUtils";

describe("Venture deployment recovery", () => {
    it("requires explicit takeover and archival while retaining the remote transaction journal", () => {
        const account = privateKeyToAccount({
            client: ventureWalletClient,
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        let record: DeploymentRecovery | null = {
            values: {
                tokenName: "Harbor Venture",
                tokenSymbol: "HBR",
                initialSupply: "21000000",
                tokensPerEth: "2000",
                deploymentNetwork: "localhost",
                acknowledged: true,
            },
            transactions: [{ label: "token implementation", hash: `0x${"a".repeat(64)}` }],
            progress: [],
            manifest: null,
            runnerId: "c00beca2-d184-4afd-b465-72ee04d38a17",
        };
        interceptGraphQLOperation("VentureDeploymentRecovery", (request) =>
            request.reply({ data: { ventureRecoveryRecord: record } }),
        );
        interceptGraphQLOperation<{ action: string; runnerId: string; record: DeploymentRecovery }>(
            "ReconcileVentureDeploymentRecovery",
            (request) => {
                expect(request.body.variables.record.transactions).to.deep.equal(record!.transactions);
                if (request.body.variables.action === "takeover") {
                    record = { ...record!, runnerId: request.body.variables.runnerId };
                } else {
                    expect(request.body.variables.action).to.equal("abandon");
                    record = null;
                }
                request.alias = request.body.variables.action;
                request.reply({ data: { reconcileVentureDeploymentRecovery: record } });
            },
        );
        mountVentureMarket(
            <DeploymentFlow
                ventureName="Harbor Venture"
                ventureId="leased"
                deploymentKey="leased"
                account={account}
                wallet={createWallet("io.metamask")}
                onSave={cy.stub()}
            />,
        );
        cy.contains("button", "Resume deployment").should("be.disabled");
        cy.contains("button", "Take over recovery").click();
        cy.contains("button", "Keep recovery unchanged").click();
        cy.contains("button", "Resume deployment").should("be.disabled");
        cy.contains("button", "Take over recovery").click();
        cy.contains("I stopped every runner and reconciled all transactions.").click();
        cy.contains("button", "Confirm takeover").click();
        cy.wait("@takeover");
        cy.contains("button", "Resume deployment").should("be.enabled");
        cy.contains("button", "Archive abandoned deployment").click();
        cy.contains("Reconcile every pending transaction").should("be.visible");
        cy.contains("button", "Confirm archive").should("be.disabled");
        cy.contains("I stopped every runner and reconciled all transactions.").click();
        cy.contains("button", "Confirm archive").click();
        cy.wait("@abandon");
        cy.contains("button", "Deploy token & governance").should("exist");
        cy.contains("button", "Resume deployment").should("not.exist");
    });
    it("keeps an unsynced transaction hash and blocks deployment until the backend recovers", () => {
        const account = privateKeyToAccount({
            client: ventureWalletClient,
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        const pending: DeploymentRecovery = {
            values: {
                tokenName: "Harbor Venture",
                tokenSymbol: "HBR",
                initialSupply: "21000000",
                tokensPerEth: "2000",
                deploymentNetwork: "localhost",
                acknowledged: true,
            },
            transactions: [{ label: "token implementation", hash: `0x${"b".repeat(64)}` }],
            progress: [],
            manifest: null,
            pendingSync: true,
        };
        let available = false;
        cy.then(() => writeDeploymentRecovery(`venture-deployment:unsynced:${account.address}`, () => pending));
        interceptGraphQLOperation("VentureDeploymentRecovery", (request) =>
            request.reply({ data: { ventureRecoveryRecord: null } }),
        );
        interceptGraphQLOperation<{ record: DeploymentRecovery }>("SaveVentureDeploymentRecovery", (request) => {
            request.reply(
                available
                    ? { body: { data: { saveVentureDeploymentRecovery: request.body.variables.record } } }
                    : { body: { errors: [{ message: "Unavailable" }] } },
            );
        }).as("syncRecovery");
        mountVentureMarket(
            <DeploymentFlow
                ventureName="Harbor Venture"
                ventureId="unsynced"
                deploymentKey="unsynced"
                account={account}
                wallet={createWallet("io.metamask")}
                onSave={cy.stub()}
            />,
        );
        cy.wait("@syncRecovery");
        cy.contains("button", "Retry loading deployment recovery").should("be.visible");
        cy.contains("button", "Deploy token & governance").should("not.exist");
        cy.contains("button", "Resume deployment").should("not.exist");
        cy.then(() => {
            available = true;
        });
        cy.contains("button", "Retry loading deployment recovery").click();
        cy.wait("@syncRecovery")
            .its("request.body.variables.record.transactions")
            .should("deep.equal", pending.transactions);
        cy.contains("button", "Resume deployment").should("be.visible");
        cy.contains("button", "Deploy token & governance").should("not.exist");
        screenshotStep("venture-recovery-unsynced-hash");
    });
    it("restores a completed deployment and retries failed persistence without offering another deployment", () => {
        const account = privateKeyToAccount({
            client: ventureWalletClient,
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        const save = cy.stub().onFirstCall().rejects(new Error("Backend unavailable"));
        save.onSecondCall().resolves();
        cy.wrap(save).as("save");
        let record: DeploymentRecovery = {
            values: {
                tokenName: "Harbor Venture",
                tokenSymbol: "HBR",
                initialSupply: "21000000",
                tokensPerEth: "2000",
                deploymentNetwork: "ethereum",
                acknowledged: true,
            },
            transactions: [],
            progress: [],
            manifest: deploymentManifest,
        };
        interceptGraphQLOperation("VentureDeploymentRecovery", (request) =>
            request.reply({ data: { ventureRecoveryRecord: record } }),
        ).as("loadRecovery");
        interceptGraphQLOperation<{ record: DeploymentRecovery }>("SaveVentureDeploymentRecovery", (request) => {
            record = request.body.variables.record;
            request.reply({ data: { saveVentureDeploymentRecovery: record } });
        }).as("saveRecovery");
        mountVentureMarket(
            <DeploymentFlow
                ventureName="Harbor Venture"
                deploymentKey="recovery-test"
                ventureId="recovery-test"
                account={account}
                wallet={createWallet("io.metamask")}
                onSave={save}
            />,
        );
        cy.wait("@loadRecovery");
        cy.contains("button", "Deploy token & governance").should("not.exist");
        cy.contains("Download deployment record").should("have.attr", "download", "venture-deployment.json");
        cy.contains("button", "Retry saving addresses").click();
        cy.contains("Backend unavailable").should("be.visible");
        cy.contains("Contracts are already deployed").should("be.visible");
        screenshotStep("venture-recovery-save-retry");
        cy.contains("button", "Retry saving addresses").click();
        cy.contains("Contracts deployed and saved to this Venture").should("be.visible");
        cy.get("@save").should("have.been.calledTwice");
        cy.then(() => expect(save.secondCall.args[0]).to.deep.equal(deploymentManifest));
    });

    it("loads an unfinished deployment from the backend on a fresh browser", () => {
        const account = privateKeyToAccount({
            client: ventureWalletClient,
            privateKey: "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        });
        const record: DeploymentRecovery = {
            values: {
                tokenName: "Harbor Venture",
                tokenSymbol: "HBR",
                initialSupply: "21000000",
                tokensPerEth: "2000",
                deploymentNetwork: "localhost",
                acknowledged: true,
            },
            transactions: [{ label: "Deploy token implementation", hash: `0x${"a".repeat(64)}` }],
            progress: [],
            manifest: null,
        };
        interceptGraphQLOperation("VentureDeploymentRecovery", (request) =>
            request.reply({ data: { ventureRecoveryRecord: record } }),
        ).as("loadRecovery");
        mountVentureMarket(
            <DeploymentFlow
                ventureName="Harbor Venture"
                ventureId="unfinished"
                deploymentKey="unfinished"
                account={account}
                wallet={createWallet("io.metamask")}
                onSave={cy.stub()}
            />,
        );
        cy.wait("@loadRecovery");
        cy.contains("button", "Resume deployment").should("be.visible");
        cy.contains("button", "Deploy token & governance").should("not.exist");
        screenshotStep("venture-recovery-another-device");
    });
});
