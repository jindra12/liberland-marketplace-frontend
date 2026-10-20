import * as React from "react";

import { Alert, Flex, Select } from "antd";

import { DeploymentSummary } from "./DeploymentSummary";
import { TokenWallet } from "./TokenWallet";
import type { VentureDeploymentPanelProps } from "./types";

export const VentureDeploymentPanel: React.FunctionComponent<VentureDeploymentPanelProps> = (props) => {
    const [deploymentId, setDeploymentId] = React.useState("");
    const deployments = props.venture.contractDeployments!;
    const deployment = deployments.find((item, index) => (item.id || String(index)) === deploymentId) || deployments[0];

    return (
        <Flex vertical gap={20}>
            {deployments.length > 1 && (
                <Select
                    aria-label="Token deployment"
                    value={deployment.id || String(deployments.indexOf(deployment))}
                    onChange={setDeploymentId}
                    options={deployments.map((item, index) => ({
                        value: item.id || String(index),
                        label: `${item.tokenSymbol || "Token"} · ${item.chain} / ${item.network || "network"}`,
                    }))}
                />
            )}
            {(!props.section || props.section === "token") && <DeploymentSummary deployment={deployment} />}
            {deployment.chain === "ethereum" &&
            deployment.chainId &&
            deployment.tokenAddress &&
            deployment.daoAddress &&
            deployment.rewardTokenAddress ? (
                <TokenWallet
                    deployment={deployment}
                    ventureId={props.venture.id}
                    serverURL={props.serverURL || props.venture.serverURL}
                    section={props.section || "token"}
                />
            ) : (
                <Alert type="info" message="Wallet controls require a complete Ethereum deployment record." />
            )}
        </Flex>
    );
};
