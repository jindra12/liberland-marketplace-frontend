import { CompanyForm } from "../../src/components/publish/CompanyForm";
import { EditCompanyForm } from "../../src/components/edit/EditCompanyForm";
import { CompanyByIdDocument } from "../../src/generated/graphql";
import { PaymentWebhookSecret } from "../../src/components/publish/CompanyPayments/PaymentWebhookSecret";
import { CompanyDonateButton } from "../../src/components/detail/companyDetail/CompanyDonateButton";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import {
    fillFormField,
    mountWithProviders,
    screenshotStep,
    selectFormOption,
} from "../support/component-tests/directBasic";
import * as React from "react";
import { Typography } from "antd";
import { useMutationState } from "@tanstack/react-query";

const MutationCacheProbe: React.FunctionComponent = () => {
    const states = useMutationState({ select: (mutation) => mutation.state.data });
    return <Typography.Text data-cy="mutation-cache">{JSON.stringify(states)}</Typography.Text>;
};

describe("Company hosted payment integration", () => {
    beforeEach(() => {
        cy.viewport(1200, 1000);
    });

    it("shows a source-specific donation link only when the backend confirms donation readiness", () => {
        mountWithProviders(
            <CompanyDonateButton companyId="company-merchant" serverUrl={MAIN_SERVER_URL} />,
        );
        cy.contains("a", "Donate").should("not.exist");
        mountWithProviders(
            <CompanyDonateButton companyId="company-merchant" serverUrl={MAIN_SERVER_URL} canAcceptThirdwebDonations />,
        );
        cy.contains("a", "Donate").should("be.visible").invoke("attr", "href").then((href) => {
            const link = new URL(href!);
            expect(link.pathname).to.equal("/pay");
            expect(link.searchParams.get("companyId")).to.equal("company-merchant");
            expect(link.searchParams.get("serverUrl")).to.equal(MAIN_SERVER_URL);
        });
        screenshotStep("company-donate-button");
        mountWithProviders(
            <CompanyDonateButton companyId="company-merchant" serverUrl={MAIN_SERVER_URL} canAcceptThirdwebDonations={false} />,
        );
        cy.contains("a", "Donate").should("not.exist");
    });

    it("explains the integration from the webhook field on company creation", () => {
        mountWithProviders(<CompanyForm mode="create" url={MAIN_SERVER_URL} />);
        cy.contains(
            ".Publish__companyPaymentWebhook .ant-form-item-extra button",
            "How to integrate payments and donations",
        ).click();
        cy.contains(".ant-modal-title", "Connect your app to Nswap payments").should("be.visible");
        cy.contains(".ant-modal-body", "NSWAP_WEBHOOK_SECRET").should("exist");
        cy.contains(".ant-modal-body", "createHostedCheckoutSession").should("exist");
        cy.get(".PaymentIntegrationGuide")
            .should("not.have.class", "ant-zoom-appear")
            .and("not.have.class", "ant-zoom-enter");
        cy.get(".PaymentIntegrationGuide .ant-modal-content").screenshot("company-payment-integration-guide", {
            disableTimersAndAnimations: false,
        });
        cy.get(".PaymentIntegrationGuide .ant-modal-body").scrollTo("bottom");
        cy.contains(".ant-modal-body", "signatureHeaders").should("exist");
        cy.contains(".ant-modal-body", "Evidence is included, not a public Thirdweb certificate").should("be.visible");
        cy.get(".PaymentIntegrationGuide .ant-modal-content").screenshot("company-payment-verification-guide", {
            disableTimersAndAnimations: false,
        });
    });

    it("saves the endpoint and fetches only credential status on edit", () => {
        expect(CompanyByIdDocument).not.to.contain("paymentWebhookSecret");
        expect(CompanyByIdDocument).not.to.contain("paymentWebhookUrl");
        cy.intercept<{ query: string }>("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (req.body.query.includes("CreateCompany")) {
                req.alias = "createMerchantCompany";
            }
            if (req.body.query.includes("query CompanyPaymentSettings")) {
                req.alias = "companyPaymentSettings";
                req.reply({
                    data: {
                        companyPaymentSettings: {
                            companyId: "company-merchant",
                            paymentWebhookUrl: "https://merchant.example/payments",
                            hasWebhookSecret: true,
                        },
                    },
                });
            }
        });
        mountWithProviders(<CompanyForm mode="create" url={MAIN_SERVER_URL} />);
        fillFormField("Company Name", "Merchant Integration");
        cy.contains("label", "Accept card and crypto payments through Thirdweb")
            .find("input").should("not.be.checked").check();
        cy.contains("label", "Accept donations in Thirdweb").find("input").should("not.be.checked").check();
        selectFormOption("Tribe", "Nova Rivers");
        fillFormField("Payment webhook URL", "https://merchant.example/payments");
        cy.contains("button", "Publish Company").click();
        cy.wait("@createMerchantCompany").then((result) => {
            expect(result.response?.statusCode).to.equal(200);
            expect(result.request.body.variables.data.paymentWebhookUrl).to.equal("https://merchant.example/payments");
            expect(result.request.body.variables.data.acceptThirdwebDonations).to.equal(true);
            expect(result.request.body.variables.data.acceptThirdwebPayments).to.equal(true);
            expect(result.request.body.variables.data).not.to.have.property("paymentWebhookSecret");
        });
        mountWithProviders(
            <EditCompanyForm
                serverUrl={MAIN_SERVER_URL}
                company={{
                    id: "company-merchant",
                    name: "Merchant Integration",
                    description: null,
                    email: null,
                    phone: null,
                    website: null,
                    identity: null,
                    cryptoAddresses: null,
                    image: null,
                    acceptThirdwebDonations: true,
                    acceptThirdwebPayments: true,
                }}
            />,
        );
        cy.wait("@companyPaymentSettings").its("request.body.variables.companyId").should("eq", "company-merchant");
        cy.get(".Publish__companyPaymentWebhook input").should("have.value", "https://merchant.example/payments");
        cy.contains("label", "Accept donations in Thirdweb").find("input").should("be.checked");
        cy.contains("label", "Accept card and crypto payments through Thirdweb").find("input").should("be.checked");
        cy.contains("test-owner-only-signing-secret").should("not.exist");
        cy.contains("button", "Rotate secret").should("be.visible");
        cy.contains("button", "Generate secret").should("not.exist");
        screenshotStep("company-payment-integration-settings");
    });

    it("lets a company opt into normal checkout without a merchant callback or donations", () => {
        cy.intercept<{ query: string }>("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            if (request.body.query.includes("CreateCompany")) {
                request.alias = "createCardPaymentCompany";
            }
        });
        mountWithProviders(<CompanyForm mode="create" url={MAIN_SERVER_URL} />);
        fillFormField("Company Name", "Card Payment Seller");
        selectFormOption("Tribe", "Nova Rivers");
        cy.contains("label", "Accept card and crypto payments through Thirdweb")
            .find("input").should("not.be.checked").check();
        cy.contains("label", "Accept donations in Thirdweb").find("input").should("not.be.checked");
        cy.get(".Publish__companyPaymentWebhook input").should("have.value", "");
        cy.contains(".ant-form-item", "Accept card and crypto payments through Thirdweb")
            .screenshot("company-thirdweb-checkout-opt-in");
        cy.contains("button", "Publish Company").click();
        cy.wait("@createCardPaymentCompany").then((result) => {
            expect(result.response?.statusCode).to.equal(200);
            expect(result.request.body.variables.data.acceptThirdwebPayments).to.equal(true);
            expect(result.request.body.variables.data.acceptThirdwebDonations).to.equal(false);
            expect(result.request.body.variables.data.paymentWebhookUrl).not.to.be.ok;
        });
    });

    it("shows a generated secret once, never caches it, and offers only rotation after dismissal", () => {
        const secret = "a".repeat(64);
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (req.body.query.includes("mutation GenerateCompanyPaymentSecret")) {
                req.alias = "generateSecret";
                req.reply({ data: { paymentSecret: { companyId: "company-merchant", secret } } });
            }
        });
        mountWithProviders(
            <>
                <PaymentWebhookSecret companyId="company-merchant" serverUrl={MAIN_SERVER_URL} hasSecret={false} />
                <MutationCacheProbe />
            </>,
        );
        cy.contains("button", "Generate secret").click();
        cy.wait("@generateSecret");
        cy.contains(secret).should("be.visible");
        cy.contains("Copy this secret now: it will not be shown again").should("be.visible");
        cy.get('[data-cy="mutation-cache"]').should("not.contain", secret);
        screenshotStep("company-secret-one-time-reveal");
        cy.contains("button", "I have saved the secret").click();
        cy.contains(secret).should("not.exist");
        cy.contains("button", "Generate secret").should("not.exist");
        cy.contains("button", "Rotate secret").should("be.visible");
        mountWithProviders(<PaymentWebhookSecret companyId="company-merchant" serverUrl={MAIN_SERVER_URL} hasSecret />);
        cy.contains(secret).should("not.exist");
        cy.contains("button", "Rotate secret").should("be.visible");
    });

    it("requires confirmation to rotate and reveals only the new secret", () => {
        const secret = "b".repeat(64);
        const issued = cy.spy().as("secretIssued");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (req.body.query.includes("mutation RotateCompanyPaymentSecret")) {
                issued();
                req.alias = "rotateSecret";
                req.reply({ data: { paymentSecret: { companyId: "company-merchant", secret } } });
            }
        });
        mountWithProviders(
            <>
                <PaymentWebhookSecret companyId="company-merchant" serverUrl={MAIN_SERVER_URL} hasSecret />
                <MutationCacheProbe />
            </>,
        );
        cy.contains("button", "Rotate secret").click();
        cy.contains("The old secret will stop working.").should("be.visible");
        cy.get("@secretIssued").should("not.have.been.called");
        cy.contains(".ant-popconfirm button", "Rotate secret").click();
        cy.wait("@rotateSecret");
        cy.contains(secret).should("be.visible");
        cy.get('[data-cy="mutation-cache"]').should("not.contain", secret);
        cy.contains("button", "I have saved the secret").click();
        cy.contains(secret).should("not.exist");
    });

    it("does not render integration credentials when the settings query is denied", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, {
            body: {
                errors: [{ message: "Only the company owner or an admin can read payment integration settings." }],
            },
        }).as("deniedSettings");
        mountWithProviders(
            <EditCompanyForm
                serverUrl={MAIN_SERVER_URL}
                company={{
                    id: "company-merchant",
                    name: "Merchant Integration",
                    description: null,
                    email: null,
                    phone: null,
                    website: null,
                    identity: null,
                    cryptoAddresses: null,
                    image: null,
                }}
            />,
        );
        cy.wait("@deniedSettings");
        cy.contains("button", "Retry").should("be.visible");
        cy.get(".Publish__companyPaymentWebhook").should("not.exist");
        cy.contains("test-owner-only-signing-secret").should("not.exist");
    });
});
