import * as React from "react";

import { Flex, Segmented, Typography } from "antd";

import type { OrderPaymentChainButtonProps } from "../OrderPaymentChainButton";
import { useOrderPaymentLockContext } from "../OrderPaymentLockContext";

import { OrderNativePayment } from "./OrderNativePayment";
import { OrderThirdwebPayment } from "./OrderThirdwebPayment";

interface OrderPaymentMethodsProps extends OrderPaymentChainButtonProps {
    onVerified: () => void;
}

export const OrderPaymentMethods: React.FunctionComponent<OrderPaymentMethodsProps> = (props) => {
    const [method, setMethod] = React.useState<string>("native");
    const lock = useOrderPaymentLockContext();

    if (
        props.chainPayment.chain !== "ethereum" ||
        !props.entry.order.thirdwebCheckoutAvailable ||
        !props.entry.order.thirdwebCheckoutRecipients?.includes(props.recipient.toLowerCase())
    ) {
        return <OrderNativePayment {...props} />;
    }

    return (
        <Flex vertical gap="middle" className="OrderPaymentMethods">
            <Typography.Text strong>
                {method === "thirdweb-started" ? "Pay by card or crypto" : "Choose how to pay"}
            </Typography.Text>
            {method !== "thirdweb-started" && (
                <Segmented
                    aria-label="Payment method"
                    value={method === "native" ? "native" : "thirdweb"}
                    disabled={lock.isPaymentPending}
                    onChange={setMethod}
                    options={[
                        { label: "ETH wallet", value: "native" },
                        { label: "Card or crypto", value: "thirdweb" },
                    ]}
                />
            )}
            {method === "native" ? (
                <OrderNativePayment {...props} />
            ) : (
                <OrderThirdwebPayment
                    entry={props.entry}
                    recipient={props.recipient}
                    onStarted={() => setMethod("thirdweb-started")}
                    onStartFailed={() => setMethod("thirdweb")}
                    onVerified={props.onVerified}
                />
            )}
        </Flex>
    );
};
