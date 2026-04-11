import * as React from "react";

import { Flex, List, Typography } from "antd";

import { CRYPTO_CHAIN_LABELS, CRYPTO_CHAIN_TICKERS } from "./constants";
import { OrderPaymentChainAction } from "./OrderPaymentChainAction";
import {
    buildPaymentKey,
    resolveOrderRecipientAddress,
    type ChainPaymentAmount,
} from "./payment/utils";
import type { PaymentProfileUser, SubmittedOrder } from "./types";

type OrderPaymentChainRowProps = {
    chainPayment: ChainPaymentAmount;
    entry: SubmittedOrder;
    isLargeScreen: boolean;
    onEntryUpdated: (entry: SubmittedOrder) => void;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onPaymentCompleted: (paymentKey: string) => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    profileUser?: PaymentProfileUser;
};

export const OrderPaymentChainRow: React.FunctionComponent<OrderPaymentChainRowProps> = (props) => {
    const recipient = resolveOrderRecipientAddress(props.entry.order, props.chainPayment.chain);
    const hasExpectedAmount = props.chainPayment.amountInSmallestUnit > 0n;
    const canPay = Boolean(recipient && hasExpectedAmount);
    const paymentKey = buildPaymentKey(props.entry, props.chainPayment.chain);
    const action = (
        <OrderPaymentChainAction
            canPay={canPay}
            chainPayment={props.chainPayment}
            entry={props.entry}
            hasExpectedAmount={hasExpectedAmount}
            isLargeScreen={props.isLargeScreen}
            key={paymentKey}
            onEntryUpdated={props.onEntryUpdated}
            onPayerAddressSelected={props.onPayerAddressSelected}
            onPaymentCompleted={props.onPaymentCompleted}
            onPaymentWalletRemembered={props.onPaymentWalletRemembered}
            paymentKey={paymentKey}
            profileUser={props.profileUser}
            recipient={recipient}
        />
    );

    if (!props.isLargeScreen) {
        return (
            <List.Item>
                <Flex vertical gap={12} className="OrderPaymentChainRow">
                    <List.Item.Meta
                        title={`${CRYPTO_CHAIN_LABELS[props.chainPayment.chain]} (${CRYPTO_CHAIN_TICKERS[props.chainPayment.chain]})`}
                        description={
                            <Flex vertical gap={4}>
                                <Typography.Text>
                                    Amount due: {props.chainPayment.amount}{" "}
                                    {CRYPTO_CHAIN_TICKERS[props.chainPayment.chain]}
                                </Typography.Text>
                                {recipient && (
                                    <Typography.Text type="secondary">
                                        Recipient: {recipient}
                                    </Typography.Text>
                                )}
                            </Flex>
                        }
                    />
                    {action}
                </Flex>
            </List.Item>
        );
    }

    return (
        <List.Item
            actions={[action]}
        >
            <List.Item.Meta
                title={`${CRYPTO_CHAIN_LABELS[props.chainPayment.chain]} (${CRYPTO_CHAIN_TICKERS[props.chainPayment.chain]})`}
                description={
                    <Flex vertical gap={4}>
                        <Typography.Text>
                            Amount due: {props.chainPayment.amount}{" "}
                            {CRYPTO_CHAIN_TICKERS[props.chainPayment.chain]}
                        </Typography.Text>
                        {recipient && (
                            <Typography.Text type="secondary">
                                Recipient: {recipient}
                            </Typography.Text>
                        )}
                    </Flex>
                }
            />
        </List.Item>
    );
};
