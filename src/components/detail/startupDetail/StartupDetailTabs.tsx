import * as React from "react";

import { TeamOutlined } from "@ant-design/icons";
import { Flex, Tabs, Tag, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../../generated/graphql";
import { EntityCommentsSection } from "../../comments/EntityCommentsSection";

import type { StartupDetailTabsProps } from "./types";

export const StartupDetailTabs: React.FunctionComponent<StartupDetailTabsProps> = (props) => {
    const involvedUsers = props.startup.involvedUsers || [];

    return (
        <Tabs
            defaultActiveKey="team"
            className="EntityDetail__tabs StartupDetail__section StartupDetail__tabs"
            items={[
                {
                    key: "team",
                    label: `Team (${involvedUsers.length})`,
                    children:
                        involvedUsers.length > 0 ? (
                            <Flex gap={8} wrap>
                                {involvedUsers.map((user) => (
                                    <Tag key={user.id} icon={<TeamOutlined />}>
                                        {user.name || user.email || "User"}
                                    </Tag>
                                ))}
                            </Flex>
                        ) : (
                            <Typography.Text type="secondary">
                                No team members yet. Be the first to join!
                            </Typography.Text>
                        ),
                },
                {
                    key: "comments",
                    label: "Discussion",
                    children: (
                        <EntityCommentsSection
                            targetId={props.startupId}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Startups}
                        />
                    ),
                },
            ]}
        />
    );
};
