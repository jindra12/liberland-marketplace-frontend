import * as React from "react";

import { Alert, Flex, Typography } from "antd";

import { LiquidityForm } from "./LiquidityForm";
import { submitVentureLiquidity } from "./liquidityUtils";
import type { LiquidityControlsProps } from "./types";

export const LiquidityControls: React.FunctionComponent<LiquidityControlsProps> = (props) => (
    <Flex vertical gap={12}>
        <Typography.Title level={5}>Uniswap V4 liquidity</Typography.Title>
        <Typography.Paragraph>
            Deposit ETH and Venture tokens to support trading and earn trading fees. Manage your deposits here with
            your connected wallet. Your position receipt is an NFT that records ownership of your deposit, not artwork
            or a DAO reward token. Trading can change the amounts and value of the assets you can withdraw.
        </Typography.Paragraph>
        <Typography.Text code copyable>
            {props.deployment.tokenAddress}
        </Typography.Text>
        {props.pool ? (
            <LiquidityForm
                connected={Boolean(props.account && props.wallet)}
                decimals={props.deployment.tokenDecimals ?? 18}
                onSubmit={(values) => submitVentureLiquidity(props, values)}
            />
        ) : (
            <Alert
                type="info"
                showIcon
                message="Liquidity pool is not available yet"
                description="Wait for this deployment's initialized pool to be indexed before managing liquidity here."
            />
        )}
    </Flex>
);
