import * as React from "react";

import { MailOutlined, TeamOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Flex, Space, Tag, Typography } from "antd";

import {
    formatFundsNeeded,
    formatStageLabel,
} from "../../../startupUtils";
import { IdentityTagLink } from "../../shared/IdentityTagLink";

import { StartupDetailActions } from "./StartupDetailActions";
import type { StartupDetailContentProps, StartupDetailHeaderProps } from "./types";
import { getStartupIdentity } from "./utils";

type StartupDetailHeaderWithActionsProps = StartupDetailHeaderProps & StartupDetailContentProps;

export const StartupDetailHeader: React.FunctionComponent<StartupDetailHeaderWithActionsProps> = (
    props,
) => {
    const startupIdentity = getStartupIdentity(props.startup);

    return (
        <Space size={props.avatarSize > 72 ? 24 : 16} align="start" className="StartupDetail__header">
            {props.imageSrc && <Avatar shape="circle" size={props.avatarSize} src={props.imageSrc} />}
            <Flex
                vertical
                gap={props.avatarSize > 72 ? 20 : 18}
                className="StartupDetail__headerBody"
            >
                <Flex
                    justify="space-between"
                    align={props.avatarSize > 72 ? "center" : "flex-start"}
                    gap="16px"
                    wrap
                    className="StartupDetail__titleRow"
                >
                    <div className="StartupDetail__titleBlock">
                        <Typography.Text className="StartupDetail__eyebrow">Venture</Typography.Text>
                        <Typography.Title level={1} className="StartupDetail__title">
                            {props.startup.title}
                        </Typography.Title>
                    </div>
                    <Flex gap={10} wrap className="StartupDetail__badgeRow">
                        <Tag color="blue">{formatStageLabel(props.startup.stage)}</Tag>
                        {startupIdentity && (
                            <IdentityTagLink
                                identity={startupIdentity}
                                color="success"
                                icon={<UsergroupAddOutlined />}
                            />
                        )}
                    </Flex>
                </Flex>
                <Flex
                    gap={props.avatarSize > 72 ? 10 : 12}
                    wrap
                    className="StartupDetail__summary"
                >
                    {props.startup.company?.name && (
                        <Tag icon={<TeamOutlined />}>{props.startup.company.name}</Tag>
                    )}
                    {props.startup.fundsNeeded?.amount != null && (
                        <Tag color="green">
                            Funds needed:{" "}
                            {formatFundsNeeded(
                                props.startup.fundsNeeded.amount,
                                props.startup.fundsNeeded.currency,
                            )}
                        </Tag>
                    )}
                    {props.startup.company?.email && (
                        <Typography.Link
                            href={`mailto:${props.startup.company.email}`}
                            className="StartupDetail__summaryLink"
                        >
                            <MailOutlined />
                            <span>{props.startup.company.email}</span>
                        </Typography.Link>
                    )}
                </Flex>
                <StartupDetailActions startup={props.startup} startupId={props.startupId} />
            </Flex>
        </Space>
    );
};
