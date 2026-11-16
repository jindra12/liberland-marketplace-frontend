import * as React from "react";

import { Collapse, Flex, List, Typography } from "antd";

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
    const recipient =
        props.chainPayment.recipient ||
        resolveOrderRecipientAddress(props.entry.order, props.chainPayment.chain);
    const hasExpectedAmount = props.chainPayment.amountInSmallestUnit > 0n;
    const canPay = Boolean(recipient && hasExpectedAmount);
    const paymentKey = buildPaymentKey(props.entry, props.chainPayment.chain, recipient);
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

    return (
        <List.Item className="OrderPaymentChainRow">
            {action}
            <Collapse
                ghost
                size="small"
                className="OrderPaymentDetails"
                items={[{
                    key: "details",
                    label: "Payment details",
                    children: (
                        <Flex vertical gap={8}>
                            <Typography.Text type="secondary">Order: {props.entry.order.id}</Typography.Text>
                            <Typography.Text type="secondary">Recipient wallet</Typography.Text>
                            <Typography.Text ellipsis={{ tooltip: recipient }} copyable={{ text: recipient }}>
                                {recipient}
                            </Typography.Text>
                        </Flex>
                    ),
                }]}
            />
        </List.Item>
    );
};
