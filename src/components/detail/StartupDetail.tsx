import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useParams } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";

import {
    MailOutlined,
    TeamOutlined,
    UsergroupAddOutlined,
    EditOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Divider, Flex, Grid, message, Space, Tabs, Tag, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../generated/graphql";
import { formatStageLabel, formatResourceLabel, formatFundsNeeded, invalidateStartupQueries } from "../../startupUtils";
import { DetailPageTracker } from "../analytics/DetailPageTracker";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useJoinStartupMutation, useLeaveStartupMutation, useStartupByIdQuery } from "../hooks";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { DetailShareSection } from "../share/DetailShareSection";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { DetailBackButton } from "./DetailBackButton";

const StartupDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const startup = useStartupByIdQuery({ id: id! });
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();
    const queryClient = useQueryClient();
    const joinMutation = useJoinStartupMutation();
    const leaveMutation = useLeaveStartupMutation();

    const userId = auth.user?.profile?.sub;

    const handleJoin = async () => {
        try {
            await joinMutation.mutateAsync({
                id: id!,
                url: startup.data?.Startup?.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            message.success("You joined this venture!");
        } catch (error) {
            console.error(error);
            message.error("Failed to join venture");
        }
    };

    const handleLeave = async () => {
        try {
            await leaveMutation.mutateAsync({
                id: id!,
                url: startup.data?.Startup?.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            message.success("You left this venture");
        } catch (error) {
            console.error(error);
            message.error("Failed to leave venture");
        }
    };

    return (
        <Loader query={startup}>
            {(data) => {
                const s = data.Startup;
                const imageSrc = getImage(s) || getImage(s?.company);
                const startupIdentity = s?.identity?.name
                    ? {
                          id: s.identity.id,
                          name: s.identity.name,
                      }
                    : undefined;
                const avatarSize = md ? 120 : 72;
                const involvedUsers = s?.involvedUsers || [];
                const isInvolved = userId ? involvedUsers.some((u) => u.id === userId) : false;
                const isOwner = userId && (s?.createdBy as { id?: string } | null)?.id === userId;
                const shareTitle = s?.title ?? "Venture";
                const shareText = `Check out ${shareTitle} on NSwap.`;

                return (
                    <Flex flex={1} vertical gap={md ? 18 : 16} className="EntityDetail StartupDetail">
                        <DetailPageTracker serverUrl={s?.serverURL ?? undefined} />
                        <DetailBackButton to="/ventures" label="Back to ventures" />
                        <Space size={md ? 24 : 16} align="start" className="StartupDetail__header">
                            {imageSrc && <Avatar shape="circle" size={avatarSize} src={imageSrc} />}
                            <Flex vertical gap={md ? 20 : 18} className="StartupDetail__headerBody">
                                <Flex
                                    justify="space-between"
                                    align={md ? "center" : "flex-start"}
                                    gap="16px"
                                    wrap
                                    className="StartupDetail__titleRow"
                                >
                                    <div className="StartupDetail__titleBlock">
                                        <Typography.Text className="StartupDetail__eyebrow">Venture</Typography.Text>
                                        <Typography.Title level={1} className="StartupDetail__title">
                                            {s?.title}
                                        </Typography.Title>
                                    </div>
                                    <Flex gap={10} wrap className="StartupDetail__badgeRow">
                                        <Tag color="blue">{formatStageLabel(s?.stage)}</Tag>
                                        {startupIdentity && (
                                            <IdentityTagLink
                                                identity={startupIdentity}
                                                color="success"
                                                icon={<UsergroupAddOutlined />}
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                                <Flex gap={md ? 10 : 12} wrap className="StartupDetail__summary">
                                    {s?.company?.name && <Tag icon={<TeamOutlined />}>{s.company.name}</Tag>}
                                    {s?.fundsNeeded?.amount != null && (
                                        <Tag color="green">
                                            Funds needed:{" "}
                                            {formatFundsNeeded(s.fundsNeeded.amount, s.fundsNeeded.currency)}
                                        </Tag>
                                    )}
                                    {typeof s?.company?.email === "string" && s.company.email && (
                                        <Typography.Link
                                            href={`mailto:${s.company.email}`}
                                            className="StartupDetail__summaryLink"
                                        >
                                            <MailOutlined />
                                            <span>{s.company.email}</span>
                                        </Typography.Link>
                                    )}
                                </Flex>
                                {auth.isAuthenticated && (
                                    <div className="StartupDetail__joinAction">
                                        {isInvolved ? (
                                            <Button
                                                icon={<UserDeleteOutlined />}
                                                onClick={handleLeave}
                                                loading={leaveMutation.isPending}
                                            >
                                                Remove Involvement
                                            </Button>
                                        ) : (
                                            <Button
                                                type="primary"
                                                icon={<UserAddOutlined />}
                                                onClick={handleJoin}
                                                loading={joinMutation.isPending}
                                            >
                                                Get Involved
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </Flex>
                        </Space>
                        {isOwner && (
                            <RouteButton to={`/ventures/edit/${id}`} icon={<EditOutlined />}>
                                Edit
                            </RouteButton>
                        )}

                        <Divider className="StartupDetail__divider" />
                        <div className="StartupDetail__section StartupDetail__section--description">
                            <Markdown>{s?.description}</Markdown>
                        </div>

                        {(s?.lookingFor?.length || s?.alreadyHave?.length) && (
                            <>
                                <Divider className="StartupDetail__divider" />
                                <div className="StartupDetail__section StartupDetail__section--resources StartupDetail__resourceGrid">
                                    {!!s?.lookingFor?.length && (
                                        <div className="StartupDetail__resourceGroup">
                                            <Typography.Text className="StartupDetail__resourceHeading">
                                                Looking for
                                            </Typography.Text>
                                            <Flex gap={6} wrap className="StartupDetail__tags">
                                                {s.lookingFor.map((r) => (
                                                    <Tag key={r} color="orange">
                                                        {formatResourceLabel(r)}
                                                    </Tag>
                                                ))}
                                            </Flex>
                                        </div>
                                    )}
                                    {!!s?.alreadyHave?.length && (
                                        <div className="StartupDetail__resourceGroup">
                                            <Typography.Text className="StartupDetail__resourceHeading">
                                                Already have
                                            </Typography.Text>
                                            <Flex gap={6} wrap className="StartupDetail__tags">
                                                {s.alreadyHave.map((r) => (
                                                    <Tag key={r} color="cyan">
                                                        {formatResourceLabel(r)}
                                                    </Tag>
                                                ))}
                                            </Flex>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        <Divider className="StartupDetail__divider" />
                        <DetailShareSection
                            label="Share this venture"
                            title={shareTitle}
                            text={shareText}
                            subscriptionTarget={
                                s
                                    ? {
                                          collection: "startups",
                                          targetID: s.id,
                                          serverURL: s.serverURL,
                                          isSubscribed: s.isSubscribed,
                                      }
                                    : undefined
                            }
                        />
                        <Divider className="StartupDetail__divider" />
                        <Tabs
                            className="EntityDetail__tabs StartupDetail__section StartupDetail__tabs"
                            defaultActiveKey="team"
                            items={[
                                {
                                    key: "team",
                                    label: `Team (${involvedUsers.length})`,
                                    children: (
                                        <div>
                                            {involvedUsers.length > 0 ? (
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
                                            )}
                                        </div>
                                    ),
                                },
                                {
                                    key: "comments",
                                    label: "Discussion",
                                    children: (
                                        <EntityCommentsSection
                                            targetId={id!}
                                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Startups}
                                        />
                                    ),
                                },
                            ]}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default StartupDetail;
