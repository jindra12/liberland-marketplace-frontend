import { Flex } from "antd";
import { DeploymentForm } from "../../src/components/VentureContracts/DeploymentForm";
import { ventureTestWalletAddress, ventureTestWalletPhrase } from "../../src/components/VentureContracts/constants";
import { getVentureChain } from "../../src/components/VentureContracts/utils";
import {
    fillFormField,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
} from "../support/component-tests/directBasic";

describe("Venture deployment form", () => {
    it("explains public wallets and MetaMask setup for both test networks, but not mainnet", () => {
        const deploy = cy.stub().resolves();
        cy.viewport(1280, 1500);
        mountWithProviders(
            <Flex className="VentureContracts">
                <DeploymentForm ventureName="Harbor Venture" busy={false} onDeploy={deploy} />
            </Flex>,
        );
        cy.get(".VentureContracts__test-wallet").should("not.exist");
        fillFormField("Symbol", "HBR");
        fillFormField("Starting price (tokens per ETH)", "2000");
        selectFormOption("Network", "Ethereum Sepolia (testnet)");
        cy.contains("Your wallet deploys. The DAO governs.").click();
        cy.get(".ant-select-dropdown").should("have.class", "ant-select-dropdown-hidden");
        cy.get(".VentureContracts__test-wallet").should("be.visible").within(() => {
            cy.contains(ventureTestWalletPhrase).should("be.visible");
            cy.contains(ventureTestWalletAddress).should("be.visible");
            cy.contains("Never send real ETH").should("be.visible");
            cy.contains("Show test networks").should("be.visible");
            cy.contains("11155111").should("be.visible");
            cy.contains("not pre-funded").should("be.visible");
            cy.contains("RPC URL:").should("not.exist");
        });
        screenshotStep("sepolia-test-wallet");
        selectFormOption("Network", "Hosted Ethereum mainnet fork (test deployment)");
        cy.contains("Your wallet deploys. The DAO governs.").click();
        cy.get(".ant-select-dropdown").should("have.class", "ant-select-dropdown-hidden");
        cy.get(".VentureContracts__test-wallet").should("be.visible").within(() => {
            cy.contains(ventureTestWalletPhrase).should("be.visible");
            cy.contains("Add a custom network").should("be.visible");
            cy.contains(`RPC URL: ${getVentureChain(31337).rpc}`).should("be.visible");
            cy.contains("31337").should("be.visible");
            cy.contains("fake ETH").should("be.visible");
            cy.contains("not pre-funded").should("not.exist");
        });
        screenshotStep("local-test-wallet");
        cy.viewport(390, 844);
        cy.get(".VentureContracts__test-wallet").scrollIntoView().should("be.visible");
        cy.get(".VentureContracts__test-wallet").then(($alert) => {
            expect($alert[0].scrollWidth).to.be.at.most($alert[0].clientWidth);
        });
        cy.document().then((document) => {
            expect(document.documentElement.scrollWidth).to.be.at.most(document.documentElement.clientWidth);
        });
        screenshotStep("local-test-wallet-mobile");
        selectFormOption("Network", "Ethereum mainnet");
        cy.get(".VentureContracts__test-wallet").should("not.exist");
        cy.then(() => expect(deploy).not.to.have.been.called);
    });

    it("selects configured networks without exposing infrastructure and validates token settings", () => {
        const deploy = cy.stub().resolves();
        cy.wrap(deploy).as("deployContracts");
        mountWithProviders(
            <Flex className="VentureContracts">
                <DeploymentForm ventureName="Harbor Venture" busy={false} onDeploy={deploy} />
            </Flex>,
        );
        cy.contains("Ethereum chain ID").should("not.exist");
        cy.contains("Network name").should("not.exist");
        cy.get('input[id="poolManagerAddress"]').should("not.exist");
        cy.get('input[id="positionManagerAddress"]').should("not.exist");
        cy.get('input[id="permit2Address"]').should("not.exist");
        cy.contains("button", "Deploy token & governance").click();
        cy.contains("Confirm the deployment and gas costs").should("be.visible");
        cy.get("@deployContracts").should("not.have.been.called");
        fillFormField("Symbol", "HBR");
        fillFormField("Fixed supply", "-1");
        cy.contains("I understand deployment").click();
        cy.contains("button", "Deploy token & governance").click();
        cy.contains("Enter a positive whole-token supply.").should("be.visible");
        cy.get("@deployContracts").should("not.have.been.called");
        fillFormField("Fixed supply", "21000000");
        fillFormField("Starting price (tokens per ETH)", "2000");
        selectFormOption("Network", "Ethereum Sepolia (testnet)");
        cy.contains("Your wallet deploys. The DAO governs.").click();
        cy.get(".ant-select-dropdown").should("have.class", "ant-select-dropdown-hidden");
        cy.contains("Starting price (tokens per ETH)").should("be.visible");
        screenshotStep("venture-deployment-settings");
        cy.contains("button", "Deploy token & governance").click();
        cy.get("@deployContracts")
            .should("have.been.calledOnce")
            .then(() => {
                expect(deploy.firstCall.args[0]).to.deep.equal({
                    tokenName: "Harbor Venture",
                    tokenSymbol: "HBR",
                    initialSupply: "21000000",
                    tokensPerEth: "2000",
                    deploymentNetwork: "sepolia",
                    acknowledged: true,
                });
            });
    });
});
