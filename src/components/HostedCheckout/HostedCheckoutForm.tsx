import * as React from "react";

import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";

import { Alert, Button, Form, InputNumber, Typography } from "antd";

import { createHostedSession } from "./utils";

interface HostedCheckoutFormProps {
    serverUrl: string;
    companyId: string;
    productId: string | null;
    quantity: number;
}

export const HostedCheckoutForm: React.FunctionComponent<HostedCheckoutFormProps> = (props) => {
    const navigate = useNavigate();
    const payment = useMutation({
        mutationFn: (values: { amount?: number }) =>
            createHostedSession(
                props.serverUrl,
                props.companyId,
                props.productId,
                props.quantity,
                values.amount === undefined ? undefined : Math.round(values.amount * 100),
            ),
        onSuccess: (session) => {
            const query = new URLSearchParams({ serverUrl: props.serverUrl, session: session.sessionId });
            navigate(`/pay?${query}`);
        },
    });
    return (
        <Form layout="vertical" className="Publish__form" initialValues={{ amount: 10 }} onFinish={payment.mutate}>
            <Typography.Title level={2}>{props.productId ? "Product payment" : "Make a donation"}</Typography.Title>
            <Typography.Paragraph>
                Pay securely through Thirdweb without creating a Nswap account. This checkout settles in USDC on Base.
                Review the recipient and final amount before paying.
            </Typography.Paragraph>
            {!props.productId && (
                <Form.Item
                    name="amount"
                    label="Donation amount (USD)"
                    rules={[{ required: true, type: "number", min: 1, max: 1_000_000 }]}
                >
                    <InputNumber min={1} max={1_000_000} precision={2} prefix="$" />
                </Form.Item>
            )}
            {payment.error && <Alert type="error" showIcon message={payment.error.message} />}
            <Form.Item>
                <Button htmlType="submit" type="primary" loading={payment.isPending}>
                    Continue to payment
                </Button>
            </Form.Item>
        </Form>
    );
};
