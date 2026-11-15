import * as React from "react";

import { Button, Flex, Result, Typography } from "antd";

interface HostedPaymentCompleteProps {
    returnUrl?: string | null;
}

export const HostedPaymentComplete: React.FunctionComponent<HostedPaymentCompleteProps> = (props) => (
    <Result
        status="success"
        title="Payment verified"
        subTitle="Thank you for your payment. The company's backend will receive its signed confirmation."
        extra={props.returnUrl && (
            <Flex vertical align="center" gap="small">
                <Button type="primary" size="large" href={props.returnUrl}>Return to app</Button>
                <Typography.Text type="secondary">{new URL(props.returnUrl).host}</Typography.Text>
            </Flex>
        )}
    />
);
