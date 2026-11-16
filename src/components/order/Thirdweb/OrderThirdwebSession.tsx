import * as React from "react";

import { useQuery } from "@tanstack/react-query";

import { Alert, Button, Flex, Typography } from "antd";

import { useVerifyOrderCheckoutSessionMutation } from "../../hooks";
import { HostedPaymentWidget } from "../../HostedCheckout/HostedPaymentWidget";
import type { HostedSession } from "../../HostedCheckout/types";

interface OrderThirdwebSessionProps {
    serverUrl: string;
    session: HostedSession;
    onVerified: () => void;
}

export const OrderThirdwebSession: React.FunctionComponent<OrderThirdwebSessionProps> = (props) => {
    const query = useQuery({
        queryKey: ["order-thirdweb-payment", props.serverUrl, props.session.sessionId],
        queryFn: useVerifyOrderCheckoutSessionMutation.fetcher({
            url: props.serverUrl,
            sessionId: props.session.sessionId,
        }),
        select: (result) => result.verifyOrderCheckoutSession,
        refetchInterval: (state) =>
            state.state.data?.verifyOrderCheckoutSession.paymentRecorded || state.state.error ? false : 3000,
        retry: false,
    });
    React.useEffect(() => {
        if (query.data?.paymentRecorded) {
            props.onVerified();
        }
    }, [query.data?.paymentRecorded, props]);

    return (
        <Flex vertical gap="middle" className="OrderThirdwebPayment">
            {query.data?.status === "paid" && (
                <Alert
                    type="info"
                    showIcon
                    message="Payment received"
                    description="Finishing your order automatically. Please do not pay again."
                />
            )}
            {!query.error && query.data?.status !== "paid" && (
                <>
                    <HostedPaymentWidget session={props.session} />
                    <Typography.Text type="secondary">
                        Complete your payment above. This page will update automatically once it is confirmed.
                    </Typography.Text>
                </>
            )}
            {query.error && (
                <Alert
                    type="error"
                    showIcon
                    message="We couldn't confirm your payment"
                    description={`${query.error.message} Retry confirmation below; this will not charge you again.`}
                />
            )}
            {query.error && (
                <Button type="primary" loading={query.isFetching} onClick={() => query.refetch()}>
                    Retry confirmation
                </Button>
            )}
        </Flex>
    );
};
