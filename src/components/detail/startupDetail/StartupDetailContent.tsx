import * as React from "react";

import { TeamOutlined } from "@ant-design/icons";
import { Divider, Flex, Grid, Tag, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo, Startup } from "../../../generated/graphql";
import { routes } from "../../../routes";
import { EntityCommentsSection } from "../../comments/EntityCommentsSection";
import { Markdown } from "../../Markdown";
import { CommonDetail } from "../CommonDetail";

import { StartupDetailHeader } from "./StartupDetailHeader";
import { StartupDetailResourcesSection } from "./StartupDetailResourcesSection";
import type { StartupDetailContentProps } from "./types";
import { getStartupDetailImage, getStartupShareText } from "./utils";

export const StartupDetailContent: React.FunctionComponent<StartupDetailContentProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const shareTitle = props.startup.title || "Venture";

    return (
        <CommonDetail
            className="StartupDetail"
            serverURL={props.startup.serverURL || undefined}
            reportPath={routes.ventures.detail.getLink(props.startup as Startup)}
            backTo={routes.ventures.route}
            backLabel="Back to ventures"
            shareLabel="Share this venture"
            shareTitle={shareTitle}
            shareText={getStartupShareText(props.startup)}
            subscriptionTarget={{
                collection: "startups",
                targetID: props.startup.id,
                serverURL: props.startup.serverURL,
                isSubscribed: props.startup.isSubscribed,
            }}
            gap={md ? 18 : 16}
            header={
                <StartupDetailHeader
                    avatarSize={md ? 120 : 72}
                    imageSrc={getStartupDetailImage(props.startup)}
                    startup={props.startup}
                    startupId={props.startupId}
                />
            }
            beforeShare={
                <>
                    <Divider className="StartupDetail__divider" />
                    <div className="StartupDetail__section StartupDetail__section--description">
                        <Markdown>{props.startup.description}</Markdown>
                    </div>

                    <StartupDetailResourcesSection startup={props.startup} />
                </>
            }
            sections={[
                {
                    key: "team",
                    label: `Team (${props.startup.involvedUsers?.length || 0})`,
                    children:
                        (props.startup.involvedUsers || []).length > 0 ? (
                            <Flex gap={8} wrap>
                                {(props.startup.involvedUsers || []).map((user) => (
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
                            serverURL={props.serverURL}
                        />
                    ),
                },
            ]}
        />
    );
};
