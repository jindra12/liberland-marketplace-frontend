import { Flex } from "antd";
import { VentureClient } from "@liberland/marketplace-contracts/client/venture";
import { parseEther } from "ethers";
import { VentureContracts } from "../../src/components/VentureContracts/VentureContracts";
import { TokenActionForm } from "../../src/components/VentureContracts/TokenActionForm";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { fillFormField, mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";
import { emptyVenture, savedDeployment } from "../support/ventureContracts";

describe("Saved Venture contracts", () => {
    it("shows persisted contracts anonymously on desktop and mobile", () => {
        mountWithProviders(
            <VentureContracts
                venture={{ ...emptyVenture, contractDeployments: [savedDeployment] }}
                serverURL={MAIN_SERVER_URL}
            />,
        );
        cy.contains("Venture token").should("be.visible");
        cy.contains("21,000,000").should("be.visible");
        cy.get('[role="tablist"]').should("not.exist");
        cy.get(".VentureContracts__connect").should("have.css", "width", "180px");
        cy.get(`a[href="https://etherscan.io/address/${savedDeployment.tokenAddress}"]`).should("be.visible");
        cy.contains("Deploy on Ethereum").should("not.exist");
        screenshotStep("venture-saved-addresses");
        cy.viewport(390, 844);
        cy.contains("Venture token").should("be.visible");
        screenshotStep("venture-saved-mobile");
        cy.document().then((document) => {
            expect(document.documentElement.scrollWidth).to.be.at.most(390);
        });
    });

    it("requires explicit DAO-unrooting consent before submitting a root request", () => {
        const submit = cy.stub().resolves("0xconfirmed-root-transaction");
        cy.wrap(submit).as("rootTransaction");
        mountWithProviders(
            <Flex className="VentureContracts">
                <TokenActionForm action="root" busy={false} onSubmit={submit} />
            </Flex>,
        );
        fillFormField("Amount", "100");
        cy.get(".VentureContracts__form").should(($form) => expect($form.width()).to.be.at.most(760));
        cy.contains("button", "Root tokens").click();
        cy.contains("Confirm that only DAO governance can unroot").should("be.visible");
        cy.get("@rootTransaction").should("not.have.been.called");
        cy.contains("I understand only a DAO vote").click();
        cy.contains("button", "Root tokens").click();
        cy.get("@rootTransaction").should("have.been.calledOnce");
        screenshotStep("venture-token-rooting");
    });

    it("connects a wallet using the compact Ethereum control", () => {
        mountWithProviders(
            <VentureContracts
                venture={{ ...emptyVenture, contractDeployments: [savedDeployment] }}
                serverURL={MAIN_SERVER_URL}
            />,
        );
        cy.get(".VentureContracts__connect.ant-btn-primary").should("have.css", "width", "180px").click();
        cy.get(".VentureContracts__connect").should("contain.text", "Connected");
    });

    it("defaults to mainnet even after a test deployment and allows switching between both", () => {
        mountWithProviders(
            <VentureContracts
                venture={{
                    ...emptyVenture,
                    contractDeployments: [
                        {
                            ...savedDeployment,
                            id: "second-deployment",
                            tokenName: "Second Venture",
                            tokenSymbol: "ALT",
                            network: "sepolia",
                            chainId: "11155111",
                            tokenAddress: `0x${"1".repeat(40)}`,
                        },
                        savedDeployment,
                    ],
                }}
                serverURL={MAIN_SERVER_URL}
            />,
        );
        cy.get(".ant-select").should("contain.text", "mainnet");
        cy.contains("Harbor Venture").should("be.visible");
        cy.get(`a[href="https://etherscan.io/address/${savedDeployment.tokenAddress}"]`).should("be.visible");
        screenshotStep("venture-multiple-deployments-mainnet-default");
        cy.contains(".ant-select", "HBR").click();
        cy.get(".ant-select-dropdown").should("be.visible");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "mainnet").should("be.visible");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "sepolia").should("be.visible");
        cy.get(".ant-select-dropdown").should(($dropdown) => {
            expect($dropdown).to.have.css("opacity", "1");
            expect($dropdown[0].getAnimations()).to.have.length(0);
        });
        screenshotStep("venture-multiple-deployments-options");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "ALT").click();
        cy.get(".ant-select-dropdown").should("have.class", "ant-select-dropdown-hidden");
        cy.contains("Second Venture").should("be.visible");
        cy.contains("Chain 11155111").should("be.visible");
        cy.get(`a[href="https://sepolia.etherscan.io/address/0x${"1".repeat(40)}"]`).should("be.visible");
        cy.get(".ant-select").should("contain.text", "sepolia");
        screenshotStep("venture-multiple-deployments-sepolia-selected");
        cy.get('[role="tablist"]').should("not.exist");
    });

    it("offers token actions in a selector rather than nested tabs", () => {
        cy.stub(VentureClient.prototype, "readAccount").resolves({
            balance: parseEther("1000"),
            liquid: parseEther("800"),
            rooted: parseEther("200"),
            votes: parseEther("200"),
            rewards: 0n,
            rewardPerPeriod: 0n,
            eligibleAt: BigInt(Math.floor(Date.now() / 1000) + 2592000),
            timestamp: BigInt(Math.floor(Date.now() / 1000)),
        });
        mountWithProviders(
            <VentureContracts
                venture={{ ...emptyVenture, contractDeployments: [savedDeployment] }}
                serverURL={MAIN_SERVER_URL}
                section="account"
            />,
        );
        cy.get(".VentureContracts__connect.ant-btn-primary").click();
        cy.contains("Liquid tokens").should("be.visible");
        cy.get('[role="tablist"]').should("not.exist");
        cy.contains(".ant-select", "Root tokens").click();
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "Transfer tokens").click();
        cy.get(".ant-select-dropdown").should("have.class", "ant-select-dropdown-hidden");
        cy.contains("label", "Recipient").should("be.visible");
        cy.contains("button", "Transfer tokens").should("be.visible");
        screenshotStep("venture-account-actions");
    });
});
