import * as React from "react";

import { Alert, Card, List, Typography } from "antd";

import { OrderPaymentChainRow } from "./OrderPaymentChainRow";
import { buildOrderEntryKey, collectOrderChainPaymentAmounts } from "./payment/utils";
import type { PaymentProfileUser, SubmittedOrder } from "./types";

type OrderPaymentOrderCardProps = {
    entry: SubmittedOrder;
    isLargeScreen: boolean;
    orderIndex: number;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onPaymentCompleted: (paymentKey: string) => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    profileUser?: PaymentProfileUser;
};

export const OrderPaymentOrderCard: React.FunctionComponent<OrderPaymentOrderCardProps> = (props) => {
    const [entryState, setEntryState] = React.useState(props.entry);

    const chainPayments = collectOrderChainPaymentAmounts(entryState.order);

    return (
        <Card
            className="OrderPaymentOrderCard"
            title={`Payment ${props.orderIndex}`}
            key={buildOrderEntryKey(entryState.url, entryState.order.id)}
        >
            <Typography.Paragraph type="secondary">
                Marketplace: {new URL(entryState.url).host}
            </Typography.Paragraph>
            {chainPayments.length === 0 ? (
                <Alert
                    showIcon
                    type="warning"
                    message="Saved payment amounts or recipients are unavailable. Do not pay until the order can be verified."
                />
            ) : (
                <List
                    dataSource={chainPayments}
                    itemLayout={props.isLargeScreen ? "horizontal" : "vertical"}
                    renderItem={(chainPayment) => {
                        return (
                            <OrderPaymentChainRow
                                chainPayment={chainPayment}
                                entry={entryState}
                                isLargeScreen={props.isLargeScreen}
                                onEntryUpdated={setEntryState}
                                onPayerAddressSelected={props.onPayerAddressSelected}
                                onPaymentCompleted={props.onPaymentCompleted}
                                onPaymentWalletRemembered={props.onPaymentWalletRemembered}
                                profileUser={props.profileUser}
                            />
                        );
                    }}
                />
            )}
        </Card>
    );
};
