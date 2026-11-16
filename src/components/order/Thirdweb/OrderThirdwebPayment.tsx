import * as React from "react";

import { useMutation } from "@tanstack/react-query";

import { Alert, Button, Flex, Typography } from "antd";

import { useCreateOrderCheckoutSessionMutation } from "../../hooks";
import { hostedSessionSchema } from "../../HostedCheckout/utils";
import type { SubmittedOrder } from "../types";

import { OrderThirdwebSession } from "./OrderThirdwebSession";

interface OrderThirdwebPaymentProps {
    entry: SubmittedOrder;
    recipient: string;
    onStarted: () => void;
    onStartFailed: () => void;
    onVerified: () => void;
}

export const OrderThirdwebPayment: React.FunctionComponent<OrderThirdwebPaymentProps> = (props) => {
    const mutation = useMutation({
        mutationFn: async () => {
            const result = await useCreateOrderCheckoutSessionMutation.fetcher({
                url: props.entry.url,
                orderId: props.entry.order.id,
                recipient: props.recipient,
            })();
            return hostedSessionSchema.parse(result.createOrderCheckoutSession);
        },
        onMutate: props.onStarted,
        onError: props.onStartFailed,
    });

    if (mutation.data) {
        return (
            <OrderThirdwebSession
                serverUrl={props.entry.url}
                session={mutation.data}
                onVerified={props.onVerified}
            />
        );
    }

    return (
        <Flex vertical align="start" gap="middle" className="OrderThirdwebPayment">
            <Typography.Paragraph>
                Pay by card or with another cryptocurrency through Thirdweb.
                Your seller receives USDC on Base. Review the total and any provider fees before paying.
            </Typography.Paragraph>
            <Alert
                type="warning"
                showIcon
                message="Already paid with ETH?"
                description="Do not pay a second time here if you have already sent the wallet payment."
            />
            {mutation.error && <Alert type="error" showIcon message={mutation.error.message} />}
            <Button type="primary" loading={mutation.isPending} onClick={() => mutation.mutate()}>
                Open secure checkout
            </Button>
        </Flex>
    );
};
