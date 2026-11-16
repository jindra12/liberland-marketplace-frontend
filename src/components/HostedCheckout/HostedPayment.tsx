import * as React from "react";

import { Alert, Flex, Typography } from "antd";

import { HostedPaymentComplete } from "./HostedPaymentComplete";
import { HostedPaymentWidget } from "./HostedPaymentWidget";
import type { HostedSession } from "./types";

interface HostedPaymentProps {
    session: HostedSession;
}

export const HostedPayment: React.FunctionComponent<HostedPaymentProps> = (props) => {
    if (props.session.status === "paid") {
        return <HostedPaymentComplete returnUrl={props.session.returnUrl} />;
    }
    if (Date.parse(props.session.expiresAt) <= Date.now()) {
        return (
            <Alert
                type="warning"
                message="This checkout link has expired"
                description="Open a new payment link from the original app."
            />
        );
    }
    return (
        <Flex vertical gap="middle">
            <Typography.Title level={3}>{props.session.title}</Typography.Title>
            <Typography.Paragraph>
                No Nswap account required. Settlement is in {props.session.settlement.symbol}; payment-provider fees and
                verification may apply.
            </Typography.Paragraph>
            <HostedPaymentWidget session={props.session} />
            <Alert
                type="info"
                showIcon
                message="Confirmation comes from the payment backend"
                description="Keep this page open while the verified payment status updates. A wallet or browser success message alone does not authorize fulfillment."
            />
        </Flex>
    );
};
