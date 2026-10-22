import { LiquidityForm } from "../../src/components/VentureContracts/LiquidityForm";
import { fillFormField, selectFormOption, screenshotStep } from "../support/component-tests/directBasic";
import { mountVentureMarket } from "../support/ventureMarket";

describe("Venture liquidity", () => {
    it("submits a bounded deposit and exposes the resulting position receipt", () => {
        const submit = cy.stub().resolves("Position receipt #42: 0xconfirmed");
        mountVentureMarket(<LiquidityForm connected decimals={18} onSubmit={submit} />);
        fillFormField("Maximum ETH deposit", "0.1");
        fillFormField("Maximum token deposit", "200");
        cy.get(".VentureContracts__form").should(($form) => expect($form.width()).to.be.at.most(760));
        cy.get(".VentureContracts__liquidity-notice").should("have.css", "margin-bottom", "22px");
        screenshotStep("venture-test-liquidity-deposit");
        cy.contains("button", "Submit liquidity transaction").click();
        cy.contains("Position receipt #42").should("be.visible");
        cy.then(() =>
            expect(submit.firstCall.args[0]).to.include({
                action: "mint",
                ethAmount: "0.1",
                tokenAmount: "200",
                slippage: 0.5,
            }),
        );
    });

    it("requires withdrawal minimums and does not submit disconnected wallets", () => {
        const submit = cy.stub().resolves("0xwithdraw");
        mountVentureMarket(<LiquidityForm connected decimals={18} onSubmit={submit} />);
        selectFormOption("Liquidity action", "Withdraw liquidity");
        fillFormField("Position receipt ID", "42");
        fillFormField("Liquidity units to withdraw", "100");
        cy.contains("button", "Submit liquidity transaction").click();
        cy.contains(".ant-form-item", "Minimum ETH received").find(".ant-form-item-explain-error").should("be.visible");
        cy.then(() => expect(submit).not.to.have.been.called);
        fillFormField("Minimum ETH received", "0.09");
        fillFormField("Minimum tokens received", "190");
        cy.viewport(390, 844);
        screenshotStep("venture-test-liquidity-withdraw");
        cy.contains("button", "Submit liquidity transaction").click();
        cy.then(() =>
            expect(submit.firstCall.args[0]).to.include({
                action: "withdraw",
                tokenId: "42",
                minimumEth: "0.09",
                minimumTokens: "190",
            }),
        );
        mountVentureMarket(<LiquidityForm connected={false} decimals={18} onSubmit={submit} />);
        cy.contains("button", "Connect wallet to manage liquidity").should("be.disabled");
    });
});
