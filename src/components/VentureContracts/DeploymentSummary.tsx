import * as React from "react";

import { BankOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { Alert, Collapse, Descriptions, Flex, Statistic, Tag, Typography } from "antd";

import { deploymentAddressLabels } from "./constants";
import { TokenWallet } from "./TokenWallet";
import type { DeploymentSummaryProps } from "./types";
import { formatTokenAmount, getAddressLink } from "./utils";

export const DeploymentSummary: React.FunctionComponent<DeploymentSummaryProps> = (props) => (
    <Flex vertical gap={20} className="VentureContracts__summary">
        <Flex gap={8} align="center" wrap>
            <Tag icon={<BankOutlined />} color="cyan">
                {props.deployment.chain} / {props.deployment.network || "Network not recorded"}
            </Tag>
            {props.deployment.chainId && <Tag>Chain {props.deployment.chainId}</Tag>}
            <Tag icon={<SafetyCertificateOutlined />}>DAO governed</Tag>
        </Flex>
        <Flex gap={32} wrap>
            <Statistic
                title="Venture token"
                value={props.deployment.tokenName || "Token"}
                suffix={props.deployment.tokenSymbol || ""}
            />
            {props.deployment.initialSupply && (
                <Statistic
                    title="Fixed supply"
                    value={formatTokenAmount(props.deployment.initialSupply, props.deployment.tokenDecimals ?? 18)}
                />
            )}
        </Flex>
        <Descriptions
            column={1}
            size="small"
            items={(
                ["tokenAddress", "daoAddress", "rewardTokenAddress", "swapRouterAddress", "timelockAddress"] as const
            )
                .filter((field) => props.deployment[field])
                .map((field) => ({
                    key: field,
                    label: deploymentAddressLabels[field],
                    children: (
                        <Typography.Link
                            className="VentureContracts__address"
                            copyable
                            href={getAddressLink(props.deployment, props.deployment[field]!)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {props.deployment[field]}
                        </Typography.Link>
                    ),
                }))}
        />
        <Alert
            showIcon
            type="info"
            message="Root tokens to participate in governance"
            description="Rooted tokens cannot be transferred. Only a DAO vote can unroot them. Continuous rooting for 30 days enables reward claims when the DAO has configured a reward. Reward tokens redeem against funded reserves; they are not Uniswap position NFTs."
        />
        <Collapse
            items={[
                {
                    key: "infrastructure",
                    label: "Infrastructure & implementation addresses",
                    children: (
                        <Descriptions
                            column={1}
                            size="small"
                            items={Object.entries(deploymentAddressLabels)
                                .filter(
                                    ([field]) =>
                                        ![
                                            "tokenAddress",
                                            "daoAddress",
                                            "rewardTokenAddress",
                                            "swapRouterAddress",
                                            "timelockAddress",
                                        ].includes(field),
                                )
                                .map(([field, label]) => ({
                                    key: field,
                                    label,
                                    children: (
                                        <Typography.Text code copyable className="VentureContracts__address">
                                            {props.deployment[field as keyof typeof deploymentAddressLabels] ||
                                                "Not recorded"}
                                        </Typography.Text>
                                    ),
                                }))}
                        />
                    ),
                },
            ]}
        />
        {props.deployment.chain === "ethereum" &&
            props.deployment.chainId &&
            props.deployment.tokenAddress &&
            props.deployment.daoAddress &&
            props.deployment.rewardTokenAddress && <TokenWallet deployment={props.deployment} />}
    </Flex>
);
