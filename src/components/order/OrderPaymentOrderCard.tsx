import * as React from "react";

import { DollarOutlined } from "@ant-design/icons";
import { Alert, Card, List, Tag } from "antd";

import { formatPriceFromCents, formatUsdFromCents } from "../shared/product/utils";

import { OrderPaymentChainRow } from "./OrderPaymentChainRow";
import { buildOrderEntryKey, collectOrderChainPaymentAmounts } from "./payment/utils";
import type { PaymentProfileUser, SubmittedOrder } from "./types";

type OrderPaymentOrderCardProps = {
    entry: SubmittedOrder;
    isLargeScreen: boolean;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    onPaymentCompleted: (paymentKey: string) => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    profileUser?: PaymentProfileUser;
};

export const OrderPaymentOrderCard: React.FunctionComponent<OrderPaymentOrderCardProps> = (props) => {
    const [entryState, setEntryState] = React.useState(props.entry);

    React.useEffect(() => {
        setEntryState(props.entry);
    }, [props.entry]);

    const chainPayments = collectOrderChainPaymentAmounts(entryState.order);
    const orderTotal =
        formatUsdFromCents(entryState.order.amount) ||
        formatPriceFromCents(entryState.order.amount, entryState.order.currency);

    return (
        <Card
            title={`Order ${entryState.order.id}`}
            key={buildOrderEntryKey(entryState.url, entryState.order.id)}
            extra={
                <Tag
                    color={orderTotal ? "gold" : "default"}
                    icon={orderTotal ? <DollarOutlined /> : undefined}
                >
                    {orderTotal ? `Price: ${orderTotal}` : "Price: N/A"}
                </Tag>
            }
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
