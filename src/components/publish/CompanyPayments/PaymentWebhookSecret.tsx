import * as React from "react";

import { Alert, Button, Flex, Form, Popconfirm, Typography } from "antd";

import { usePaymentWebhookSecret } from "./usePaymentWebhookSecret";

interface PaymentWebhookSecretProps {
    companyId: string;
    serverUrl: string;
    hasSecret: boolean;
}

export const PaymentWebhookSecret: React.FunctionComponent<PaymentWebhookSecretProps> = (props) => {
    const issue = usePaymentWebhookSecret(props.companyId, props.serverUrl);
    return (
        <Form.Item label="Payment signing secret">
            <Flex vertical gap="middle" align="flex-start">
                <Typography.Paragraph type="secondary">
                    Secrets are shown only once. Save the value securely on your receiving backend; you cannot view it
                    again. If you lose it, rotate it. Never embed it in a mobile or browser app.
                </Typography.Paragraph>
                {issue.secret ? (
                    <>
                        <Alert
                            type="warning"
                            showIcon
                            message="Copy this secret now: it will not be shown again"
                            description="Update your receiving backend with this value. Any previous secret is no longer valid. Pending webhook deliveries use the current secret; in-flight deliveries may already have used the old key."
                        />
                        <Typography.Text code copyable className="PaymentWebhookSecret__value">
                            {issue.secret}
                        </Typography.Text>
                        <Button onClick={issue.dismiss}>I have saved the secret</Button>
                    </>
                ) : props.hasSecret || issue.hasIssued ? (
                    <Popconfirm
                        title="Rotate the payment signing secret?"
                        description="The old secret will stop working. You must immediately update your receiving backend."
                        okText="Rotate secret"
                        onConfirm={() => issue.mutation.mutate("rotate")}
                    >
                        <Button danger loading={issue.mutation.isPending}>
                            Rotate secret
                        </Button>
                    </Popconfirm>
                ) : (
                    <Button
                        type="primary"
                        loading={issue.mutation.isPending}
                        onClick={() => issue.mutation.mutate("generate")}
                    >
                        Generate secret
                    </Button>
                )}
                {issue.mutation.error && <Alert type="error" showIcon message={issue.mutation.error.message} />}
            </Flex>
        </Form.Item>
    );
};
