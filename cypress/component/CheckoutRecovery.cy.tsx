import { mountCheckoutSecurityFixture } from "../support/security-regressions/checkout/utils";

describe("Checkout recovery and draft retention", { retries: 0 }, () => {
    it("recovers an already-created unpaid order after the checkout component reloads", () => {
        const fixture = mountCheckoutSecurityFixture("success");
        cy.get("#customerEmail").should("have.value", "alice@example.test");
        cy.contains("button", "Create order").click();
        cy.contains("created-order").should("exist");
        cy.then(() => fixture.mountAgain());
        cy.contains("created-order").should("exist");
    });
    ["later-order", "cart-delete"].forEach((failure) => {
        it(`keeps a created order available for payment after ${failure} fails`, () => {
            mountCheckoutSecurityFixture(failure === "later-order" ? "later-order" : "cart-delete");
            cy.get("#customerEmail").should("have.value", "alice@example.test");
            cy.contains("button", "Create order").click();
            cy.wait("@failedCheckout");
            cy.get("@createdOrder").should("have.been.calledOnce");
            cy.contains("button", "Create order").should("not.be.disabled").and("not.have.class", "ant-btn-loading");
            cy.contains("created-order").should("exist");
            cy.contains("button", "Create order").click();
            cy.wait("@failedCheckout");
            cy.get("@createdOrder").should("have.been.calledOnce");
        });
    });

    it("keeps edited shipping inputs mounted during a background cart refresh", () => {
        const fixture = mountCheckoutSecurityFixture("refresh");
        cy.get("#customerEmail").should("have.value", "alice@example.test").clear().type("edited@example.test");
        cy.then(() => {
            fixture.reads.paused = true;
            fixture.refresh.work = fixture.client.refetchQueries({ queryKey: ["CartBySecret"] });
        });
        cy.get("@checkoutReadStarted").should("have.been.called");
        cy.get("body").then(async ($body) => {
            const draftDuringRefresh = $body.find("#customerEmail").val();
            fixture.gate.resolve();
            await fixture.refresh.work;
            expect(draftDuringRefresh).to.equal("edited@example.test");
        });
    });
});
