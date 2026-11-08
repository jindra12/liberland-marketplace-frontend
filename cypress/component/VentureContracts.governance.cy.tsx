import { DaoProposalCard } from "../../src/components/VentureContracts/DaoProposalCard";
import { ProposalForm } from "../../src/components/VentureContracts/ProposalForm";
import { fillFormField, selectFormOption, screenshotStep } from "../support/component-tests/directBasic";
import { activeProposal, mountVentureMarket } from "../support/ventureMarket";
import { Interface, parseEther } from "ethers";
import { deploymentArtifacts } from "@liberland/marketplace-contracts/deployment/artifacts";
import { savedDeployment } from "../support/ventureContracts";

describe("Venture DAO governance", () => {
    it("decodes a nested router fee change even when the description claims to change rewards", () => {
        const dao = new Interface(deploymentArtifacts.daoArtifact.abi);
        const router = new Interface(deploymentArtifacts.swapArtifact.abi);
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{
                    ...activeProposal,
                    description: "Just update rewards",
                    calldatas: [
                        dao.encodeFunctionData("relay", [
                            savedDeployment.swapRouterAddress!,
                            0n,
                            router.encodeFunctionData("setFee", [1000n, "0x1111111111111111111111111111111111111111"]),
                        ]),
                    ],
                }}
                decimals={18}
                connected
                busy={false}
                onAction={cy.stub()}
            />,
        );
        cy.contains("relay(address,uint256,bytes)").should("be.visible");
        cy.contains("setFee(uint256,address)").should("be.visible");
        cy.contains("feeBps_ (uint256): 1000").should("be.visible");
        cy.contains("Upgrade or arbitrary execution").should("be.visible");
    });

    it("does not present a familiar selector on an unknown target as verified contract behavior", () => {
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, targets: ["0x1111111111111111111111111111111111111111"] }}
                decimals={18}
                connected
                busy={false}
                onAction={cy.stub()}
            />,
        );
        cy.contains("Unknown target or nested call").should("be.visible");
        cy.contains("setRewardPerPeriod(uint256)").should("not.exist");
        cy.contains("Upgrade or arbitrary execution").should("be.visible");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, calldatas: ["0x01"] }}
                decimals={18}
                connected
                busy={false}
                onAction={cy.stub()}
            />,
        );
        cy.contains("Upgrade or arbitrary execution").should("be.visible");
        cy.contains("0x01").should("be.visible");
        cy.contains("setRewardPerPeriod(uint256)").should("not.exist");
    });

    it("warns about executable upgrade calldata hidden behind an innocent description", () => {
        const dao = new Interface(deploymentArtifacts.daoArtifact.abi);
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{
                    ...activeProposal,
                    description: "Just a harmless reward change",
                    values: [parseEther("1")],
                    calldatas: [
                        dao.encodeFunctionData("upgradeToAndCall", [
                            "0x1111111111111111111111111111111111111111",
                            "0x12345678",
                        ]),
                    ],
                }}
                decimals={18}
                connected
                busy={false}
                onAction={cy.stub()}
            />,
        );
        cy.contains("upgradeToAndCall").should("be.visible");
        cy.contains("Upgrade or arbitrary execution").should("be.visible");
        cy.contains("1.0 ETH").should("be.visible");
        cy.contains("0x12345678").should("be.visible");
    });

    it("requires a governed target and explicit consent before proposing a permanent upgrade freeze", () => {
        const submit = cy.stub().resolves("0xfreeze-proposal");
        cy.wrap(submit).as("proposal");
        mountVentureMarket(<ProposalForm busy={false} onSubmit={submit} />);
        cy.contains(".ant-form-item", "Proposal type").find(".ant-select-selector").click();
        cy.get("#kind").type(`${"{downArrow}".repeat(7)}{enter}`, { force: true });
        cy.contains(".ant-select-selection-item", "Permanently freeze contract upgrades").should("be.visible");
        fillFormField("Proposal description", "Permanently freeze the audited token implementation.");
        cy.contains("button", "Submit proposal").click();
        cy.contains("Confirm that you understand").should("be.visible");
        cy.get("@proposal").should("not.have.been.called");
        selectFormOption("Governed contract", "Venture token");
        cy.get(".ant-select-dropdown").should("not.be.visible");
        cy.contains("I understand the consequences").click();
        screenshotStep("venture-dao-upgrade-controls");
        cy.contains("button", "Submit proposal").click();
        cy.get("@proposal").should("have.been.calledOnce");
        cy.then(() =>
            expect(submit.firstCall.args[0]).to.include({
                kind: "freeze-upgrades",
                target: "token",
                acknowledged: true,
            }),
        );
    });
    it("shows proposal totals and submits a rooted-holder vote with a reason", () => {
        const act = cy.stub().resolves("0xvote");
        cy.wrap(act).as("vote");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={activeProposal}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("Snapshot quorum").should("be.visible");
        cy.contains("setRewardPerPeriod(uint256)").should("be.visible");
        cy.contains("5000000000000000000").should("be.visible");
        cy.contains("Your snapshot votes: 200.0").should("be.visible");
        cy.get(".VentureContracts__form").should(($form) => expect($form.width()).to.be.at.most(760));
        selectFormOption("Your vote", "Against");
        fillFormField("Reason (optional)", "Keep rewards reserve-backed.");
        screenshotStep("venture-dao-voting");
        cy.contains("button", "Cast vote").click();
        cy.get("@vote").should("have.been.calledOnce");
        cy.then(() =>
            expect(act.firstCall.args[0]).to.include({
                action: "vote",
                support: 0,
                reason: "Keep rewards reserve-backed.",
            }),
        );
    });

    it("does not offer a duplicate vote or allow execution before the timelock", () => {
        const act = cy.stub().resolves("0xgovernance");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, hasVoted: true }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("Your vote is already recorded").should("be.visible");
        cy.contains("button", "Cast vote").should("not.exist");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, state: 5, eta: activeProposal.timestamp + 100n }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Execute proposal").should("be.disabled");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, state: 5, eta: activeProposal.timestamp - 1n }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Execute proposal").should("be.enabled").click();
        cy.then(() => expect(act.firstCall.args[0].action).to.equal("execute"));
    });

    it("blocks voting without snapshot power or a connected wallet", () => {
        const act = cy.stub().resolves("0xvote");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, votingPower: 0n }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Cast vote").should("be.disabled");
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={activeProposal}
                decimals={18}
                connected={false}
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Cast vote").should("be.disabled");
        cy.viewport(390, 844);
        screenshotStep("venture-dao-mobile");
    });

    it("validates fee proposals before asking the wallet to submit them", () => {
        const submit = cy.stub().resolves("0xproposal");
        cy.wrap(submit).as("proposal");
        mountVentureMarket(<ProposalForm busy={false} onSubmit={submit} />);
        selectFormOption("Proposal type", "Swap fee (%) and recipient");
        fillFormField("Amount (tokens, or percent for swap fee / quorum)", "11");
        fillFormField("Proposal description", "Set a 0.25% swap fee.");
        cy.contains("button", "Submit proposal").click();
        cy.contains("Fee must be 0-10%").should("be.visible");
        cy.contains("Enter a valid recipient").should("be.visible");
        cy.get("@proposal").should("not.have.been.called");
        fillFormField("Amount (tokens, or percent for swap fee / quorum)", "0.25");
        fillFormField("Recipient / account", "0x1111111111111111111111111111111111111111");
        cy.contains("button", "Submit proposal").click();
        cy.get("@proposal").should("have.been.calledOnce");
    });
    it("offers cancellation only for an eligible pending proposal", () => {
        const act = cy.stub();
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, state: 0, canCancel: true }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Cancel my pending proposal").click();
        cy.then(() => expect(act.firstCall.args[0].action).to.equal("cancel"));
        mountVentureMarket(
            <DaoProposalCard
                deployment={savedDeployment}
                proposal={{ ...activeProposal, state: 0, canCancel: false }}
                decimals={18}
                connected
                busy={false}
                onAction={act}
            />,
        );
        cy.contains("button", "Cancel my pending proposal").should("not.exist");
    });

    it("validates quorum and accepts an integer voting period", () => {
        const submit = cy.stub();
        mountVentureMarket(<ProposalForm busy={false} onSubmit={submit} />);
        cy.contains(".ant-form-item", "Proposal type").find(".ant-select-selector").click();
        cy.get("#kind").type(`${"{downArrow}".repeat(12)}{enter}`, { force: true });
        cy.contains(".ant-select-selection-item", "Quorum (%)").should("be.visible");
        fillFormField("Amount (tokens, or percent for swap fee / quorum)", "101");
        fillFormField("Proposal description", "Set safe governance parameters.");
        cy.contains("button", "Submit proposal").click();
        cy.contains("Quorum must be greater than 0%").should("be.visible");
        cy.then(() => expect(submit).not.to.have.been.called);
        cy.contains(".ant-form-item", "Proposal type").find(".ant-select-selector").click();
        cy.get("#kind").type("{upArrow}{upArrow}{enter}", { force: true });
        cy.contains(".ant-select-selection-item", "Voting period (seconds)").should("be.visible");
        fillFormField("Duration (seconds)", "86400");
        screenshotStep("venture-governance-settings");
        cy.contains("button", "Submit proposal").click();
        cy.then(() => expect(submit.firstCall.args[0]).to.include({ kind: "voting-period", amount: "86400" }));
    });
});
