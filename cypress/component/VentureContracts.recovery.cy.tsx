import { createWallet, privateKeyToAccount } from "thirdweb/wallets";
import { DeploymentFlow } from "../../src/components/VentureContracts/DeploymentFlow";
import type { DeploymentRecovery } from "../../src/components/VentureContracts/types";
import { ventureWalletClient } from "../../src/components/VentureContracts/constants";
import { mountVentureMarket } from "../support/ventureMarket";
import { deploymentManifest } from "../support/ventureContracts";
import { screenshotStep } from "../support/component-tests/directBasic";
import { writeDeploymentRecovery } from "../../src/components/VentureContracts/recoveryUtils";

describe("Venture deployment recovery", () => {
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
        cy.intercept("GET", "**/api/startups/unsynced/deployment-recovery*", { body: { record: null } });
        cy.intercept("PUT", "**/api/startups/unsynced/deployment-recovery*", (request) => {
            request.reply(
                available ? { body: { record: request.body } } : { statusCode: 503, body: { error: "Unavailable" } },
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
        cy.wait("@syncRecovery").its("request.body.transactions").should("deep.equal", pending.transactions);
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
        cy.intercept("GET", "**/api/startups/recovery-test/deployment-recovery*", (request) =>
            request.reply({ record }),
        ).as("loadRecovery");
        cy.intercept("PUT", "**/api/startups/recovery-test/deployment-recovery*", (request) => {
            record = request.body as DeploymentRecovery;
            request.reply({ record });
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
        cy.intercept("GET", "**/api/startups/unfinished/deployment-recovery*", { body: { record } }).as("loadRecovery");
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
