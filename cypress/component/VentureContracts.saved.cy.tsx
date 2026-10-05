import { Flex } from "antd";
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
        cy.contains("button", "Root tokens").click();
        cy.contains("Confirm that only DAO governance can unroot").should("be.visible");
        cy.get("@rootTransaction").should("not.have.been.called");
        cy.contains("I understand only a DAO vote").click();
        cy.contains("button", "Root tokens").click();
        cy.get("@rootTransaction").should("have.been.calledOnce");
        screenshotStep("venture-token-rooting");
    });
});
