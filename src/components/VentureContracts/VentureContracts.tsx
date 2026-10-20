import * as React from "react";

import { Empty, Flex, Typography } from "antd";

import { useIsOwnedByServerUser } from "../detail/useIsOwnedByServerUser";

import { ventureContractSections } from "./constants";
import { DeploymentWallet } from "./DeploymentWallet";
import type { VentureContractsProps } from "./types";
import { useVentureDeployment } from "./useVentureDeployment";
import { VentureDeploymentPanel } from "./VentureDeploymentPanel";

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
                <Typography.Title level={3}>
                    {ventureContractSections.find((section) => section.key === (props.section || "token"))!.label}
                </Typography.Title>
                <Typography.Paragraph type="secondary">
                    A fixed-supply token, rooted-holder voting and reserve-backed rewards. Addresses are saved with this
                    Venture on its marketplace server, so they remain available after deployment.
                </Typography.Paragraph>
            </Flex>
            {props.venture.contractDeployments?.length ? (
                <VentureDeploymentPanel {...props} />
            ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="This Venture has no deployed token yet." />
            )}
            {owned && (!props.section || props.section === "token") && (
                <DeploymentWallet
                    ventureName={props.venture.title || "Venture"}
                    deploymentKey={`${props.serverURL || props.venture.serverURL}:${props.venture.id}`}
                    ventureId={props.venture.id}
                    serverURL={props.serverURL || props.venture.serverURL}
                    onSave={save}
                />
            )}
        </Flex>
    );
};
