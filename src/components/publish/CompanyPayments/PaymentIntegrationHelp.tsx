import * as React from "react";

import { Alert, Button, Modal, Typography } from "antd";

import {
    buildDonationLink,
    buildMerchantRequestExample,
    PAYMENT_NOTIFICATION_EXAMPLE,
    VERIFY_PAYMENT_EXAMPLE,
} from "./utils";

interface PaymentIntegrationHelpProps {
    serverUrl: string;
    companyId?: string | null;
}

export const PaymentIntegrationHelp: React.FunctionComponent<PaymentIntegrationHelpProps> = (props) => {
    const [open, setOpen] = React.useState(false);
    return (
        <>
            <Button type="link" onClick={() => setOpen(true)}>
                How to integrate payments and donations
            </Button>
            <Modal
                title="Connect your app to Nswap payments"
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                width={850}
                className="PaymentIntegrationGuide"
            >
                <Typography.Paragraph>
                    Add your public HTTPS webhook endpoint and an Ethereum-compatible payout wallet. Your company does
                    not need a Thirdweb account. Your marketplace operator configures Thirdweb once. Customers pay on
                    Nswap without a Nswap account; wallet or card providers may still require connection or
                    verification.
                </Typography.Paragraph>
                <Alert
                    type="info"
                    showIcon
                    message="Settlement: USDC on Base"
                    description="Dollar-priced purchases and donations settle in USDC on Base (chain 8453). Thirdweb offers the available crypto/card routes. Provider minimums, network fees and geographic restrictions apply."
                />
                <Typography.Title level={4}>1. Configure your receiving backend</Typography.Title>
                <Typography.Paragraph>
                    Save the company, reopen Edit, and click Generate secret. Copy the one-time value to your backend
                    environment as NSWAP_WEBHOOK_SECRET before closing it. You cannot view it again; if it is lost,
                    use Rotate secret and immediately update your receiving backend. Rotation invalidates the old key.
                    Never put it in a mobile app, browser bundle or payment link. One webhook
                    receives all this company’s products and donations.
                </Typography.Paragraph>
                <Typography.Title level={4}>2. Link to checkout</Typography.Title>
                <Typography.Paragraph>
                    Reusable donation link (the donor chooses the amount, minimum $1):
                </Typography.Paragraph>
                <Typography.Paragraph copyable className="PaymentIntegrationGuide__code">
                    {buildDonationLink(props.serverUrl, props.companyId || "YOUR_COMPANY_ID")}
                </Typography.Paragraph>
                <Typography.Paragraph>
                    For a fixed-price product, append productId and quantity to that link. The backend loads the product
                    price itself; URL parameters cannot override it. Hosted checkout sends payment notifications to your
                    fulfillment system; it does not create a marketplace cart order or collect a delivery address.
                </Typography.Paragraph>
                <Typography.Paragraph>
                    To credit a specific app user or order, create the session from your backend with a signed
                    externalReference. Product requests use productId and optional quantity instead of amountUsdCents.
                    Only put an opaque reference here, not personal data.
                </Typography.Paragraph>
                <Typography.Paragraph copyable className="PaymentIntegrationGuide__code">
                    {buildMerchantRequestExample(props.serverUrl, props.companyId || "YOUR_COMPANY_ID")}
                </Typography.Paragraph>
                <Typography.Title level={4}>3. Accept signed notifications</Typography.Title>
                <Typography.Paragraph>
                    We POST application/json with X-Nswap-Event-Id, X-Nswap-Timestamp (Unix seconds) and
                    X-Nswap-Signature. The signature is hexadecimal HMAC-SHA256(secret, timestamp + "." + exact raw
                    body). Validate its timestamp within five minutes. Process each event ID only once. Delivery is
                    at-least-once, with up to ten exponential retries; return 2xx to acknowledge it. The backend’s
                    durable job worker must be running. Do not fulfill based on a browser success callback.
                </Typography.Paragraph>
                <Typography.Paragraph copyable className="PaymentIntegrationGuide__code">
                    {VERIFY_PAYMENT_EXAMPLE}
                </Typography.Paragraph>
                <Typography.Paragraph>
                    Example notification (identifiers and transaction hashes below are illustrative):
                </Typography.Paragraph>
                <Typography.Paragraph copyable className="PaymentIntegrationGuide__code">
                    {PAYMENT_NOTIFICATION_EXAMPLE}
                </Typography.Paragraph>
                <Alert
                    type="warning"
                    showIcon
                    message="Evidence is included, not a public Thirdweb certificate"
                    description="We include the original provider body, signature headers, payment ID and destination transactions, plus the checks we performed. Thirdweb uses a shared-secret HMAC: your company verifies our signature, not Thirdweb’s signature independently. You can independently inspect the destination transaction onchain. Never request or distribute the operator’s Thirdweb webhook secret."
                />
            </Modal>
        </>
    );
};
