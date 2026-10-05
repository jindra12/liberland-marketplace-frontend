import { Flex } from "antd";
import { DeploymentForm } from "../../src/components/VentureContracts/DeploymentForm";
import {
    fillFormField,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
} from "../support/component-tests/directBasic";

describe("Venture deployment form", () => {
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
        selectFormOption("Network", "Ethereum Sepolia (testnet)");
        screenshotStep("venture-deployment-settings");
        cy.contains("button", "Deploy token & governance").click();
        cy.get("@deployContracts")
            .should("have.been.calledOnce")
            .then(() => {
                expect(deploy.firstCall.args[0]).to.deep.equal({
                    tokenName: "Harbor Venture",
                    tokenSymbol: "HBR",
                    initialSupply: "21000000",
                    deploymentNetwork: "sepolia",
                    acknowledged: true,
                });
            });
    });
});
