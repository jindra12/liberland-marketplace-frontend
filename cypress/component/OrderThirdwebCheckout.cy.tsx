import { OrderPaymentStep } from "../../src/components/order/OrderPaymentStep";
import type { SubmittedOrder } from "../../src/components/order/types";
import { Order_CryptoPrices_Chain, Order_PaymentTargets_Chain } from "../../src/generated/graphql";
import type { HostedSession } from "../../src/components/HostedCheckout/types";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";
import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";

const recipient = "0x1111111111111111111111111111111111111111";
const order: SubmittedOrder["order"] = {
    id: "order-thirdweb",
    thirdwebCheckoutAvailable: true,
    thirdwebCheckoutRecipients: [recipient],
    amount: 1000,
    paymentTargets: [{ chain: Order_PaymentTargets_Chain.Ethereum, productID: "product-first",
        recipientAddress: recipient, normalizedRecipientAddress: recipient, quantity: 2, unitAmount: 5, stableAmount: 10 }],
    cryptoPrices: [{ chain: Order_CryptoPrices_Chain.Ethereum, nativePerStable: "0.0005", stablePerNative: 2000 }],
};
const session: HostedSession = {
    sessionId: "8cb7516d-e899-4d06-a02a-a37554364985",
    title: "Order order-thirdweb",
    status: "pending",
    paymentRecorded: false,
    expiresAt: "2099-01-01T00:00:00.000Z",
    amountUsdCents: 1000,
    receiver: recipient,
    thirdwebClientId: "test-project",
    settlement: { chainId: 8453, tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6, symbol: "USDC" },
    purchaseData: { nswapSessionId: "8cb7516d-e899-4d06-a02a-a37554364985" },
};

describe("Thirdweb normal checkout", () => {
    it("keeps identical order IDs on two backends separate and waits for both verified receipts", () => {
        const recorded: Record<string, boolean> = { [MAIN_SERVER_URL]: false, [COOP_SERVER_URL]: false };
        const completed = cy.stub().as("allPaymentsComplete");
        interceptGraphQLOperation<{ orderId: string; recipient: string }>("CreateOrderCheckoutSession", (request) => {
            expect(request.body.variables).to.deep.equal({ orderId: order.id, recipient });
            request.alias = "createOrderThirdweb";
            request.reply({ data: { createOrderCheckoutSession: session } });
        });
        interceptGraphQLOperation<{ sessionId: string }>("VerifyOrderCheckoutSession", (request) => {
            const serverUrl = new URL(request.url).origin;
            request.alias = serverUrl === MAIN_SERVER_URL ? "verifyMain" : "verifyCoop";
            request.reply({ data: { verifyOrderCheckoutSession: {
                sessionId: session.sessionId,
                status: recorded[serverUrl] ? "paid" : "pending",
                paymentRecorded: recorded[serverUrl],
            } } });
        });
        mountWithProviders(<OrderPaymentStep
            submittedOrders={[{ url: MAIN_SERVER_URL, order }, { url: COOP_SERVER_URL, order }]}
            profileUsersByUrl={{}}
            onPayerAddressSelected={async () => {}}
            onAllPaymentsComplete={completed}
        />);
        cy.get(".OrderPaymentOrderCard").first().should("contain", "Choose how to pay");
        cy.get(".OrderPaymentOrderCard").first().screenshot("checkout-payment-method-desktop");
        cy.get(".OrderPaymentOrderCard").each(($card, index) => {
            cy.wrap($card).within(() => {
                cy.contains(".ant-segmented-item", "Card or crypto").click();
                cy.contains("USDC on Base").should("be.visible");
                cy.contains("0.005 ETH").should("not.exist");
                if (index === 0) {
                    cy.root().screenshot("checkout-card-or-crypto-desktop");
                }
                cy.contains("button", "Open secure checkout").click();
                cy.wait("@createOrderThirdweb");
                cy.get('[data-cy="thirdweb-checkout"]').should("contain", "10.00").and("contain", recipient);
            });
        });
        cy.wait("@verifyMain");
        cy.wait("@verifyCoop");
        cy.get("@allPaymentsComplete").should("not.have.been.called");
        cy.contains("button", "Verify payment").should("not.exist");
        cy.contains("button", "Retry confirmation").should("not.exist");
        cy.contains("This page will update automatically").should("be.visible");
        screenshotStep("thirdweb-checkout-two-backends-desktop");
        cy.viewport(390, 844);
        cy.document().then((document) => expect(document.documentElement.scrollWidth).to.be.at.most(390));
        cy.get(".OrderPaymentOrderCard").first().screenshot("thirdweb-checkout-mobile");
        cy.then(() => { recorded[MAIN_SERVER_URL] = true; });
        cy.wait("@verifyMain");
        cy.get(".OrderPaymentOrderCard").eq(0).contains("Payment submitted").should("be.visible");
        cy.get("@allPaymentsComplete").should("not.have.been.called");
        cy.then(() => { recorded[COOP_SERVER_URL] = true; });
        cy.wait("@verifyCoop");
        cy.get("@allPaymentsComplete").should("have.been.calledOnce");
        screenshotStep("thirdweb-checkout-verified");
    });

    it("shows backend errors without claiming payment success or locking out a retry", () => {
        interceptGraphQLOperation("CreateOrderCheckoutSession", (request) => {
            request.reply({ data: null, errors: [{ message: "This recipient already has a payment proof. Do not pay again." }] });
        }).as("rejectedCheckout");
        const completed = cy.stub().as("allPaymentsComplete");
        mountWithProviders(<OrderPaymentStep
            submittedOrders={[{ url: MAIN_SERVER_URL, order }]}
            profileUsersByUrl={{}}
            onPayerAddressSelected={async () => {}}
            onAllPaymentsComplete={completed}
        />);
        cy.contains(".ant-segmented-item", "Card or crypto").click();
        cy.contains("button", "Open secure checkout").click();
        cy.wait("@rejectedCheckout");
        cy.get(".ant-alert-error").should("contain", "Do not pay again");
        cy.contains("button", "Open secure checkout").should("be.enabled");
        cy.get("@allPaymentsComplete").should("not.have.been.called");
        cy.contains(".ant-segmented-item", "ETH wallet").click();
        cy.contains("button", "Connect").should("be.visible");
    });

    it("keeps direct ETH available without advertising Thirdweb on an unconfigured backend", () => {
        mountWithProviders(<OrderPaymentStep
            submittedOrders={[{ url: MAIN_SERVER_URL, order: { ...order, thirdwebCheckoutAvailable: false } }]}
            profileUsersByUrl={{}}
            onPayerAddressSelected={async () => {}}
            onAllPaymentsComplete={cy.stub()}
        />);
        cy.contains("Card or crypto").should("not.exist");
        cy.contains("button", "Connect").should("be.visible");
    });

    it("does not offer card payments when the seller has not opted in", () => {
        mountWithProviders(<OrderPaymentStep
            submittedOrders={[{ url: MAIN_SERVER_URL, order: { ...order, thirdwebCheckoutRecipients: [] } }]}
            profileUsersByUrl={{}}
            onPayerAddressSelected={async () => {}}
            onAllPaymentsComplete={cy.stub()}
        />);
        cy.contains("Card or crypto").should("not.exist");
        cy.contains("button", "Connect").should("be.visible");
    });

    it("recovers a verification failure without offering another charge or assuming success", () => {
        interceptGraphQLOperation("CreateOrderCheckoutSession", (request) => {
            request.reply({ data: { createOrderCheckoutSession: session } });
        }).as("createSession");
        const verification = { recovered: false };
        interceptGraphQLOperation("VerifyOrderCheckoutSession", (request) => {
            if (!verification.recovered) {
                request.reply({ data: null, errors: [{ message: "Order confirmation was interrupted." }] });
                return;
            }
            request.reply({ data: { verifyOrderCheckoutSession: {
                sessionId: session.sessionId, status: "paid", paymentRecorded: true,
            } } });
        }).as("verifySession");
        const completed = cy.stub().as("allPaymentsComplete");
        mountWithProviders(<OrderPaymentStep
            submittedOrders={[{ url: MAIN_SERVER_URL, order }]}
            profileUsersByUrl={{}}
            onPayerAddressSelected={async () => {}}
            onAllPaymentsComplete={completed}
        />);
        cy.contains(".ant-segmented-item", "Card or crypto").click();
        cy.contains("button", "Open secure checkout").click();
        cy.wait("@createSession");
        cy.wait("@verifySession");
        cy.get(".ant-alert-error").should("contain", "Order confirmation was interrupted");
        cy.get('[data-cy="thirdweb-checkout"]').should("not.exist");
        cy.get("@allPaymentsComplete").should("not.have.been.called");
        cy.contains("this will not charge you again").should("be.visible");
        cy.get(".OrderPaymentOrderCard").screenshot("checkout-retry-confirmation");
        cy.then(() => { verification.recovered = true; });
        cy.contains("button", "Retry confirmation").click();
        cy.wait("@verifySession");
        cy.contains("Payment submitted").should("be.visible");
        cy.get("@allPaymentsComplete").should("have.been.calledOnce");
    });
});
