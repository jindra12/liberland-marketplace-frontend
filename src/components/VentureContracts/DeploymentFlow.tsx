import * as React from "react";

import { Alert, Button, Flex, List, Skeleton, Typography } from "antd";

import { DeploymentForm } from "./DeploymentForm";
import type { DeploymentFlowProps } from "./types";
import { useDeploymentFlow } from "./useDeploymentFlow";

export const DeploymentFlow: React.FunctionComponent<DeploymentFlowProps> = (props) => {
    const flow = useDeploymentFlow(props);
    return (
        <Flex vertical gap={16}>
            {!flow.ready && !flow.error && <Skeleton active />}
            {!flow.ready && flow.error && <Button onClick={flow.retryLoad}>Retry loading deployment recovery</Button>}
            {flow.error && (
                <Alert
                    type="error"
                    showIcon
                    message={flow.error}
                    description={
                        flow.manifest
                            ? "Contracts are already deployed. Retry saving their addresses; do not deploy again."
                            : "Log into the same marketplace account and connect the same wallet, on any device. Submitted transactions are saved on the backend and verified before repeating a step."
                    }
                />
            )}
            {flow.saved && <Alert type="success" showIcon message="Contracts deployed and saved to this Venture" />}
            {flow.ready && !flow.manifest && !flow.recoveryValues && (
                <DeploymentForm
                    ventureName={props.ventureName}
                    busy={flow.busy || Boolean(flow.error && flow.progress.length)}
                    onDeploy={(values) => flow.deploy(values, props.account, props.wallet)}
                />
            )}
            {flow.ready && !flow.manifest && flow.recoveryValues && (
                <Button
                    type="primary"
                    loading={flow.busy}
                    onClick={() => flow.deploy(flow.recoveryValues!, props.account, props.wallet)}
                >
                    Resume deployment
                </Button>
            )}
            {flow.manifest && (
                <Flex gap={12} wrap>
                    {!flow.saved && (
                        <Button type="primary" loading={flow.busy} disabled={!flow.ready} onClick={flow.retrySave}>
                            Retry saving addresses
                        </Button>
                    )}
                    <Button
                        download="venture-deployment.json"
                        href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(flow.manifest, null, 2))}`}
                    >
                        Download deployment record
                    </Button>
                    {flow.saved && <Button onClick={flow.startAnotherDeployment}>Start another deployment</Button>}
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
