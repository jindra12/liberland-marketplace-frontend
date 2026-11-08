import { mountNativePaymentFixture } from "../support/security-regressions/payments/utils";
import { paymentBroadcastCounts } from "../support/walletStub/state";

describe("Native payment proof recovery", { retries: 0 }, () => {
    (["ethereum", "solana"] as const).forEach((chain) => {
        it(`recovers a ${chain} proof after remounting without sending another payment`, () => {
            const hash = chain === "ethereum" ? `0x${"ab".repeat(32)}` : "solana-tx-stub";
            const saveProof = cy.stub().rejects(new Error("Proof storage temporarily unavailable"));
            mountNativePaymentFixture(chain, saveProof);
            cy.contains("button", "Connect").click();
            cy.contains("button", "Pay").click();
            cy.wrap(saveProof).should("have.been.calledOnceWith", hash);
            cy.contains("Payment failed").should("exist");
            cy.then(() => {
                expect(paymentBroadcastCounts[chain]).to.equal(1);
                saveProof.resolves();
                return mountNativePaymentFixture(chain, saveProof);
            });
            cy.contains(hash).should("exist");
            cy.contains("button", "Pay").click();
            cy.wrap(saveProof).should("have.been.calledTwice");
            cy.contains("button", "Pay").should("be.disabled");
            cy.then(() => {
                expect(saveProof.secondCall.args[0]).to.equal(hash);
                expect(paymentBroadcastCounts[chain]).to.equal(1);
            });
        });
    });

    it("retains an Ethereum broadcast when its receipt is unavailable and confirms that same hash on retry", () => {
        const hash = `0x${"ab".repeat(32)}`;
        const saveProof = cy.stub().resolves();
        mountNativePaymentFixture("ethereum", saveProof, false);
        cy.contains("button", "Connect").click();
        cy.contains("button", "Pay").click();
        cy.contains("Payment failed").should("exist");
        cy.contains(hash).should("exist");
        cy.wrap(saveProof).should("not.have.been.called");
        cy.then(() => mountNativePaymentFixture("ethereum", saveProof));
        cy.contains("button", "Pay").click();
        cy.wrap(saveProof).should("have.been.calledOnceWith", hash);
        cy.contains("button", "Pay").should("be.disabled");
        cy.then(() => expect(paymentBroadcastCounts.ethereum).to.equal(1));
    });
});
