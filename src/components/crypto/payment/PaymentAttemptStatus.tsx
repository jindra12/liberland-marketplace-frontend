import * as React from "react";

import { Result, Space, Typography } from "antd";

import type { PaymentAttempt } from "./types";

interface PaymentAttemptStatusProps {
    attempt?: PaymentAttempt;
    error: Error | null;
    orderId: string;
}

export const PaymentAttemptStatus: React.FunctionComponent<PaymentAttemptStatusProps> = (props) => (
    <Space direction="vertical">
        {props.attempt && (
            <Typography.Paragraph>
                Transaction sent: <Typography.Text code>{props.attempt.hash}</Typography.Text>
                {props.attempt.phase !== "saved" && " Retry checks this transaction; it will not send another payment."}
            </Typography.Paragraph>
        )}
        {props.error && (
            <Result
                status="warning"
                title="Payment failed"
                subTitle={`Order ID: ${props.orderId}. ${props.error.message}`}
            />
        )}
    </Space>
);
