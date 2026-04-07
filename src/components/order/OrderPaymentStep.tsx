import * as React from "react";

import { Grid, Typography } from "antd";

import { OrderPaymentLockProvider } from "./OrderPaymentLockContext";
import { OrderPaymentOrderCard } from "./OrderPaymentOrderCard";
import {
    collectOrderChainPaymentAmounts,
    resolveOrderRecipientAddress,
} from "./payment/utils";
import type { PaymentProfileUsersByUrl, SubmittedOrder } from "./types";

type OrderPaymentStepProps = {
    onAllPaymentsComplete: () => void;
    onPaymentWalletRemembered?: () => Promise<void>;
    onPayerAddressSelected: (entry: SubmittedOrder, walletAddress: string) => Promise<void>;
    profileUsersByUrl: PaymentProfileUsersByUrl;
    submittedOrders: SubmittedOrder[];
};

export const OrderPaymentStep: React.FunctionComponent<OrderPaymentStepProps> = (props) => {
    const { lg } = Grid.useBreakpoint();
    const [, setCompletedPaymentKeys] = React.useState<Record<string, boolean>>({});

    const requiredPaymentCount = props.submittedOrders.reduce((count, entry) => {
        return (
            count +
            collectOrderChainPaymentAmounts(entry.order).filter((chainPayment) => {
                return Boolean(resolveOrderRecipientAddress(entry.order, chainPayment.chain));
            }).length
        );
    }, 0);

    const markPaymentSubmitted = (paymentKey: string) => {
        setCompletedPaymentKeys((previous) => {
            if (previous[paymentKey]) {
                return previous;
            }

            const nextCompletedPaymentKeys = {
                ...previous,
                [paymentKey]: true,
            };

            if (
                requiredPaymentCount > 0 &&
                Object.keys(nextCompletedPaymentKeys).length === requiredPaymentCount
            ) {
                props.onAllPaymentsComplete();
            }

            return nextCompletedPaymentKeys;
        });
    };

    return (
        <OrderPaymentLockProvider>
            <Typography.Paragraph type="secondary">
                Orders submitted. Pay each order using the chain amount below.
            </Typography.Paragraph>

            {props.submittedOrders.map((entry, index) => {
                return (
                    <OrderPaymentOrderCard
                        key={`${entry.url}::${entry.order.id}`}
                        entry={entry}
                        isLargeScreen={Boolean(lg)}
                        orderIndex={index + 1}
                        onPayerAddressSelected={props.onPayerAddressSelected}
                        onPaymentCompleted={markPaymentSubmitted}
                        onPaymentWalletRemembered={props.onPaymentWalletRemembered}
                        profileUser={props.profileUsersByUrl[entry.url]}
                    />
                );
            })}
        </OrderPaymentLockProvider>
    );
};
