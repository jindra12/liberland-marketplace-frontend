import * as React from "react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button, Card, Flex, Typography } from "antd";
import type { FC } from "react";
import { mount } from "cypress/react";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { AntProvider } from "../../src/components/AntProvider";
import type { SubmittedOrder } from "../../src/components/order/types";
import { RememberWalletCheckbox } from "../../src/components/order/RememberWalletCheckbox";
import { useOrderPaymentChainController } from "../../src/components/order/useOrderPaymentChainController";
import type { ChainPaymentAmount } from "../../src/components/order/payment/utils";
import type { PaymentProfileUser } from "../../src/components/order/types";
import { Company_CryptoAddresses_Chain } from "../../src/generated/graphql";
import { screenshotStep } from "../support/component-tests/directBasic";

const chainPayment: ChainPaymentAmount = {
    amount: "1",
    amountInSmallestUnit: 1n,
    chain: "ethereum",
    recipient: "0xRemember0001",
    productIds: ["product-remember-wallet"],
};

const order: SubmittedOrder["order"] = {
    id: "order-remember-wallet",
    items: [
        {
            quantity: 1,
            product: {
                id: "product-remember-wallet",
                company: {
                    id: "company-remember-wallet",
                    cryptoAddresses: {
                        address: "0xRemember0001",
                        chain: "ethereum" as Company_CryptoAddresses_Chain,
                    },
                },
            },
        },
    ],
};

const entry: SubmittedOrder = {
    url: MAIN_SERVER_URL,
    order,
};

const profileUser: PaymentProfileUser = {
    id: "user-nova",
    wallets: [],
};

type HarnessProps = {
    profileUser?: PaymentProfileUser;
};

const RememberWalletHarness: FC<HarnessProps> = (props) => {
    const [rememberedCount, setRememberedCount] = React.useState(0);
    const [paymentComplete, setPaymentComplete] = React.useState(false);
    const controller = useOrderPaymentChainController({
        chainPayment,
        entry,
        onEntryUpdated: () => {},
        onPayerAddressSelected: async () => {},
        onPaymentCompleted: () => {
            setPaymentComplete(true);
        },
        onPaymentWalletRemembered: async () => {
            setRememberedCount((count) => count + 1);
        },
        paymentKey: "order-remember-wallet::ethereum",
        profileUser: props.profileUser,
    });

    return (
        <Flex vertical gap={16}>
            <Flex gap={12} wrap>
                <Button
                    onClick={() =>
                        controller.handleWalletSelected({ address: "0xabc", chain: "ethereum", provider: "metamask" })
                    }
                >
                    Select wallet
                </Button>
                <Button type="primary" onClick={() => controller.handleTransactionId("0xtransaction")}>
                    Commit payment
                </Button>
            </Flex>
            <Typography.Text>
                Saved wallets:{" "}
                <Typography.Text className="RememberWalletHarness__rememberedCount">{rememberedCount}</Typography.Text>
            </Typography.Text>
            {paymentComplete ? (
                <Typography.Text className="RememberWalletHarness__paymentComplete">Payment complete</Typography.Text>
            ) : controller.showRememberWallet ? (
                <RememberWalletCheckbox
                    checked={controller.rememberWallet}
                    disabled={controller.isSavingWallet}
                    onChange={controller.setRememberWallet}
                />
            ) : null}
        </Flex>
    );
};

const mountHarness = (props: HarnessProps) => {
    const queryClient = new QueryClient();
    mount(
        <AntProvider>
            <QueryClientProvider client={queryClient}>
                <Card title="Payment wallet">
                    <RememberWalletHarness profileUser={props.profileUser} />
                </Card>
            </QueryClientProvider>
        </AntProvider>,
    );
};

describe("remember wallet", () => {
    it("does not show the remember checkbox to anonymous users", () => {
        mountHarness({});

        cy.contains("Select wallet").click();
        cy.contains("Remember this wallet for future payments").should("not.exist");
        screenshotStep("remember-wallet-anonymous");
    });

    it("shows the remember checkbox for authenticated users", () => {
        mountHarness({ profileUser });

        cy.contains("Select wallet").click();
        cy.contains("Remember this wallet for future payments").should("be.visible");
        screenshotStep("remember-wallet-visible");
    });

    it("does not remember the wallet unless the checkbox is checked", () => {
        mountHarness({ profileUser });

        cy.contains("Select wallet").click();
        cy.contains("Remember this wallet for future payments").should("be.visible");
        screenshotStep("remember-wallet-checked-state");
        cy.contains("Commit payment").click();
        cy.get(".RememberWalletHarness__rememberedCount").should("have.text", "0");
    });

    it("remembers the selected wallet when the checkbox is checked", () => {
        mountHarness({ profileUser });

        cy.contains("Select wallet").click();
        cy.contains("Remember this wallet for future payments").click();
        cy.contains("Commit payment").click();
        cy.get(".RememberWalletHarness__rememberedCount").should("have.text", "1");
        cy.contains(".RememberWalletHarness__paymentComplete", "Payment complete").should("be.visible");
        screenshotStep("remember-wallet-remembered");
    });
});
