import { resetWalletStubState } from "../support/walletStub/state";
import { mountTronBroadcastFixture } from "../support/security-regressions/payments/utils";

describe("TRON broadcast integrity", { retries: 0 }, () => {
    afterEach(() => resetWalletStubState());

    it("keeps the known transaction hash available after remounting when proof persistence failed", () => {
        mountTronBroadcastFixture(true, true);
        cy.contains("button", "Pay").click();
        cy.get("@broadcast").should("have.been.calledOnce");
        cy.get("@saveProof").should("have.been.calledOnce");
        cy.contains("Payment failed").should("exist");
        cy.then(() => mountTronBroadcastFixture(true));
        cy.contains("ab".repeat(32)).should("exist");
    });

    it("retries saving a known broadcast hash without asking the wallet to send payment again", () => {
        mountTronBroadcastFixture(true, true);
        cy.contains("button", "Pay").click();
        cy.get("@saveProof").should("have.been.calledOnce");
        cy.contains("Payment failed").should("exist");
        cy.contains("button", "Pay").should("not.be.disabled").click();
        cy.get("@saveProof").should("have.been.calledTwice");
        cy.get("@broadcast").should("have.been.calledOnce");
    });

    [false, true].forEach((accepted) => {
        it(`does not save a payment proof for a ${accepted ? "broadcast-only" : "rejected"} transaction`, () => {
            mountTronBroadcastFixture(accepted, false, false);
            cy.contains("button", "Pay").click();
            cy.get("@broadcast").should("have.been.calledOnce");
            cy.contains("button", "Pay").should("not.be.disabled");
            cy.get("@saveProof").should("not.have.been.called");
        });
    });
});
