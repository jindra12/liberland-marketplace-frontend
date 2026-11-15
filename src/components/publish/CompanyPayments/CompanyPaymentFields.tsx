import * as React from "react";

import { Checkbox, Form, Input, Typography } from "antd";

import { buildMaxLengthRule, TEXT_INPUT_MAX_LENGTH } from "../../form/constants";

import { PaymentIntegrationHelp } from "./PaymentIntegrationHelp";
import { PaymentWebhookSecret } from "./PaymentWebhookSecret";

interface CompanyPaymentFieldsProps {
    serverUrl: string;
    companyId?: string | null;
    hasSecret: boolean;
}

export const CompanyPaymentFields: React.FunctionComponent<CompanyPaymentFieldsProps> = (props) => (
    <>
        <Form.Item
            name="acceptThirdwebDonations"
            valuePropName="checked"
            initialValue={false}
            extra="Show a Donate button on your company page. Configure an Ethereum-compatible payout wallet, webhook URL and signing secret below. Donations settle in USDC on Base."
        >
            <Checkbox>Accept donations in Thirdweb</Checkbox>
        </Form.Item>
        <Form.Item
            name="paymentWebhookUrl"
            label="Payment webhook URL"
            className="Publish__companyPaymentWebhook"
            rules={[
                { type: "url", message: "Enter a public HTTPS webhook URL." },
                buildMaxLengthRule(TEXT_INPUT_MAX_LENGTH),
                { pattern: /^https:\/\//, message: "Webhook URLs must use HTTPS." },
            ]}
            extra={<PaymentIntegrationHelp serverUrl={props.serverUrl} companyId={props.companyId} />}
        >
            <Input placeholder="https://api.your-app.example/payments" />
        </Form.Item>
        {props.companyId ? (
            <PaymentWebhookSecret companyId={props.companyId} serverUrl={props.serverUrl} hasSecret={props.hasSecret} />
        ) : (
            <Typography.Paragraph type="secondary">
                Save the company, then generate its signing secret from Edit. It will be shown only once.
            </Typography.Paragraph>
        )}
    </>
);
