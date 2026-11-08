// eslint-disable-next-line no-restricted-syntax -- Use React's runtime default import for namespace types.
import React from "react";

import { Alert, Flex, Typography } from "antd";

import type { GovernanceCall } from "./types";

export interface GovernanceCallDetailsProps {
    call: GovernanceCall;
}

export const GovernanceCallDetails: React.FunctionComponent<GovernanceCallDetailsProps> = (props) => (
    <Flex vertical gap={8}>
        <Typography.Text code className="VentureContracts__address">
            {props.call.signature}
        </Typography.Text>
        <Typography.Text copyable className="VentureContracts__address">
            Target: {props.call.target}
        </Typography.Text>
        <Typography.Text>Native value: {props.call.value}</Typography.Text>
        {props.call.arguments.map((argument) => (
            <Typography.Text code key={argument} className="VentureContracts__address">
                {argument}
            </Typography.Text>
        ))}
        {props.call.risky && (
            <Alert
                type="warning"
                showIcon
                message="Upgrade or arbitrary execution"
                description="Review the target, implementation and all nested calldata. ABI decoding does not prove that deployed code is safe or that the proposal description is truthful."
            />
        )}
        <Typography.Paragraph code copyable className="VentureContracts__address">
            {props.call.data}
        </Typography.Paragraph>
        {props.call.nested.map((call, index) => (
            <GovernanceCallDetails key={`${index}:${call.target}`} call={call} />
        ))}
    </Flex>
);
