import * as React from "react";

import { Alert, Card, List } from "antd";

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
            title={`${props.orderIndex}${props.orderIndex === 1 ? "st" : props.orderIndex === 2 ? "nd" : props.orderIndex === 3 ? "rd" : "th"} payment`}
            key={buildOrderEntryKey(entryState.url, entryState.order.id)}
        >
            {chainPayments.length === 0 ? (
                <Alert
                    showIcon
                    type="warning"
                    message="No chain-native prices available for this order."
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
