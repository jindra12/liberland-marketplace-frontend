import * as React from "react";

import { Flex, Typography } from "antd";

import { CRYPTO_CHAIN_LABELS, CRYPTO_CHAIN_TICKERS } from "../constants";
import { OrderPaymentChainButton, type OrderPaymentChainButtonProps } from "../OrderPaymentChainButton";

export const OrderNativePayment: React.FunctionComponent<OrderPaymentChainButtonProps> = (props) => (
    <Flex vertical gap="middle" className="OrderNativePayment">
        <Flex vertical gap={4}>
            <Typography.Text type="secondary">
                Pay on {CRYPTO_CHAIN_LABELS[props.chainPayment.chain]}
            </Typography.Text>
            <Typography.Title level={4} className="OrderPaymentAmount">
                {props.chainPayment.amount} {CRYPTO_CHAIN_TICKERS[props.chainPayment.chain]}
            </Typography.Title>
            <Typography.Text type="secondary">
                Connect your wallet, then approve the payment in your wallet.
            </Typography.Text>
        </Flex>
        <OrderPaymentChainButton {...props} />
    </Flex>
);
