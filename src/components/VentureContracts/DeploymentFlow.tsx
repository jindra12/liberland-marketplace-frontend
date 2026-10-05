import * as React from "react";

import { Alert, Button, Flex, List, Typography } from "antd";

import { DeploymentForm } from "./DeploymentForm";
import type { DeploymentFlowProps } from "./types";
import { useDeploymentFlow } from "./useDeploymentFlow";

export const DeploymentFlow: React.FunctionComponent<DeploymentFlowProps> = (props) => {
    const flow = useDeploymentFlow(props.onSave);
    return (
        <Flex vertical gap={16}>
            {flow.error && (
                <Alert
                    type="error"
                    showIcon
                    message={flow.error}
                    description={
                        flow.manifest
                            ? "Contracts are already deployed. Retry saving their addresses; do not deploy again."
                            : "Confirmed transactions cannot be undone. Keep the transaction history below if deployment was interrupted."
                    }
                />
            )}
            {flow.saved && <Alert type="success" showIcon message="Contracts deployed and saved to this Venture" />}
            {!flow.manifest && (
                <DeploymentForm
                    ventureName={props.ventureName}
                    busy={flow.busy || Boolean(flow.error && flow.progress.length)}
                    onDeploy={(values) => flow.deploy(values, props.account, props.wallet)}
                />
            )}
            {flow.manifest && (
                <Flex gap={12} wrap>
                    {!flow.saved && (
                        <Button type="primary" loading={flow.busy} onClick={flow.retrySave}>
                            Retry saving addresses
                        </Button>
                    )}
                    <Button
                        download="venture-deployment.json"
                        href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(flow.manifest, null, 2))}`}
                    >
                        Download deployment record
                    </Button>
                </Flex>
            )}
            {flow.progress.length > 0 && (
                <List
                    size="small"
                    header="Confirmed deployment transactions"
                    dataSource={flow.progress}
                    renderItem={(transaction) => (
                        <List.Item>
                            <Flex vertical>
                                <Typography.Text>{transaction.label}</Typography.Text>
                                <Typography.Text code copyable>
                                    {transaction.hash}
                                </Typography.Text>
                            </Flex>
                        </List.Item>
                    )}
                />
            )}
        </Flex>
    );
};
