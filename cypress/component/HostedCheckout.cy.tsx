import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";
import HostedCheckout from "../../src/components/HostedCheckout/HostedCheckout";
import { HostedSessionView } from "../../src/components/HostedCheckout/HostedSessionView";
import type { HostedSession } from "../../src/components/HostedCheckout/types";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";

const session: HostedSession = {
    sessionId: "8cb7516d-e899-4d06-a02a-a37554364985",
    title: "Donation to Merchant",
    status: "pending",
    expiresAt: "2099-01-01T00:00:00.000Z",
    amountUsdCents: 1000,
    receiver: "0x1111111111111111111111111111111111111111",
    thirdwebClientId: "test-project",
    settlement: {
        chainId: 8453,
        tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
        decimals: 6,
        symbol: "USDC",
    },
    purchaseData: { nswapSessionId: "8cb7516d-e899-4d06-a02a-a37554364985" },
};

describe("Guest hosted checkout", () => {
    it("rejects an invalid backend before rendering a checkout", () => {
        mountWithProviders(<HostedCheckout />, { route: "/pay?serverUrl=invalid&companyId=merchant" });
        cy.contains("This payment link has an invalid marketplace backend URL.").should("be.visible");
        cy.contains("button", "Continue to payment").should("not.exist");
    });

    it("requires a company when no existing session was supplied", () => {
        mountWithProviders(<HostedCheckout />, { route: `/pay?serverUrl=${encodeURIComponent(MAIN_SERVER_URL)}` });
        cy.contains("This payment link is missing its company.").should("be.visible");
        cy.contains("button", "Continue to payment").should("not.exist");
    });

    it("creates a donation session without sending credentials or claiming an external account", () => {
        interceptGraphQLOperation<{ input: { companyId: string; amountUsdCents: number } }>(
            "CreateHostedCheckoutSession",
            (req) => {
                expect(req.body.variables.input).to.deep.equal({ companyId: "merchant", amountUsdCents: 1000 });
                expect(req.headers).not.to.have.property("authorization");
                req.reply({ body: { data: { createHostedCheckoutSession: session } } });
            },
        ).as("donationSession");
        interceptGraphQLOperation("HostedCheckoutSession", (req) => {
            req.reply({ body: { data: { hostedCheckoutSession: session } } });
        }).as("createdCheckoutStatus");
        mountWithProviders(<HostedCheckout />, {
            route: `/pay?serverUrl=${encodeURIComponent(MAIN_SERVER_URL)}&companyId=merchant`,
        });
        cy.contains("without creating a Nswap account").should("be.visible");
        screenshotStep("guest-donation-form");
        cy.contains("button", "Continue to payment").click();
        cy.wait("@donationSession");
        cy.location("search").should("contain", `session=${session.sessionId}`);
        cy.wait("@createdCheckoutStatus");
        cy.get('[data-cy="thirdweb-checkout"]').should("contain", "10.00");
    });

    it("shows verified success only after the backend reports payment completed", () => {
        const status: { value: HostedSession["status"] } = { value: "pending" };
        interceptGraphQLOperation("HostedCheckoutSession", (req) => {
            req.reply({ body: { data: { hostedCheckoutSession: { ...session, status: status.value } } } });
        }).as("checkoutStatus");
        mountWithProviders(<HostedCheckout />, {
            route: `/pay?serverUrl=${encodeURIComponent(MAIN_SERVER_URL)}&session=${session.sessionId}`,
        });
        cy.wait("@checkoutStatus");
        cy.get('[data-cy="thirdweb-checkout"]').should("contain", "10.00").and("contain", session.receiver);
        cy.contains("Payment verified").should("not.exist");
        cy.then(() => {
            status.value = "paid";
        });
        cy.wait("@checkoutStatus");
        cy.contains("Payment verified").should("be.visible");
        cy.get('[data-cy="thirdweb-checkout"]').should("not.exist");
        screenshotStep("guest-payment-verified");
    });

    it("offers the stored app return link only after backend payment verification", () => {
        const status: { value: HostedSession["status"] } = { value: "pending" };
        const returnUrl = "https://app.liberterra.io/me/merits/thank-you?orderId=saved-donation";
        interceptGraphQLOperation("HostedCheckoutSession", (req) => {
            req.reply({ body: { data: { hostedCheckoutSession: { ...session, status: status.value, returnUrl } } } });
        }).as("returnCheckoutStatus");
        mountWithProviders(<HostedSessionView serverUrl={MAIN_SERVER_URL} sessionId={session.sessionId} />);
        cy.wait("@returnCheckoutStatus");
        cy.contains("a", "Return to app").should("not.exist");
        cy.then(() => {
            status.value = "paid";
        });
        cy.wait("@returnCheckoutStatus");
        cy.contains("a", "Return to app").should("be.visible").and("have.attr", "href", returnUrl);
        cy.contains("app.liberterra.io").should("be.visible");
        screenshotStep("verified-donation-return-to-app");
    });

    it("rejects unsafe return destinations supplied by a backend", () => {
        interceptGraphQLOperation("HostedCheckoutSession", (req) => {
            req.reply({
                body: {
                    data: {
                        hostedCheckoutSession: {
                            ...session,
                            status: "paid",
                            returnUrl: "javascript:alert(document.cookie)",
                        },
                    },
                },
            });
        }).as("unsafeReturnStatus");
        mountWithProviders(<HostedSessionView serverUrl={MAIN_SERVER_URL} sessionId={session.sessionId} />);
        cy.wait("@unsafeReturnStatus");
        cy.get(".ant-alert-error").should("be.visible");
        cy.contains("a", "Return to app").should("not.exist");
    });
});
