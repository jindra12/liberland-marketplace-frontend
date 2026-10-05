import * as React from "react";

import { Empty, Flex, Tabs, Typography } from "antd";

import { useIsOwnedByServerUser } from "../detail/useIsOwnedByServerUser";

import { DeploymentSummary } from "./DeploymentSummary";
import { DeploymentWallet } from "./DeploymentWallet";
import type { VentureContractsProps } from "./types";
import { useVentureDeployment } from "./useVentureDeployment";

export const VentureContracts: React.FunctionComponent<VentureContractsProps> = (props) => {
    const owned = useIsOwnedByServerUser({
        ownerUserId: props.venture.createdBy?.id,
        serverURL: props.serverURL || props.venture.serverURL,
    });
    const save = useVentureDeployment(props);
    return (
        <Flex vertical gap={20} className="VentureContracts">
            <Flex vertical gap={4}>
                <Typography.Text className="VentureContracts__eyebrow">ON-CHAIN VENTURE</Typography.Text>
                <Typography.Title level={3}>Token & governance</Typography.Title>
                <Typography.Paragraph type="secondary">
                    A fixed-supply token, rooted-holder voting and reserve-backed rewards. Addresses are saved with this
                    Venture on its marketplace server, so they remain available after deployment.
                </Typography.Paragraph>
            </Flex>
            {props.venture.contractDeployments?.length ? (
                <Tabs
                    items={props.venture.contractDeployments.map((deployment, index) => ({
                        key: deployment.id || String(index),
                        label: `${deployment.tokenSymbol || "Token"} · ${deployment.chain} / ${deployment.network || "network"}`,
                        children: <DeploymentSummary deployment={deployment} />,
                    }))}
                />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="This Venture has no deployed token yet." />
            )}
            {owned && <DeploymentWallet ventureName={props.venture.title || "Venture"} onSave={save} />}
        </Flex>
    );
};
