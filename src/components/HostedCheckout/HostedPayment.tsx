import * as React from "react";

import { Alert, Flex, Typography } from "antd";
import { createThirdwebClient, defineChain } from "thirdweb";
import { CheckoutWidget } from "thirdweb/react";

import { HostedPaymentComplete } from "./HostedPaymentComplete";
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
            <CheckoutWidget
                client={createThirdwebClient({ clientId: props.session.thirdwebClientId })}
                chain={defineChain(props.session.settlement.chainId)}
                seller={props.session.receiver}
                tokenAddress={props.session.settlement.tokenAddress}
                amount={(props.session.amountUsdCents / 100).toFixed(2)}
                purchaseData={props.session.purchaseData}
                name={props.session.title}
                paymentMethods={["crypto", "card"]}
                feePayer="user"
                theme="dark"
            />
            <Alert
                type="info"
                showIcon
                message="Confirmation comes from the payment backend"
                description="Keep this page open while the verified payment status updates. A wallet or browser success message alone does not authorize fulfillment."
            />
        </Flex>
    );
};
