import * as React from "react";
import { Avatar,
    Button,
    Divider,
    Flex,
    Grid,
    message,
    Space,
    Tabs,
    Tag,
    Typography
} from "antd";
import { Link, useParams } from "react-router-dom";
import {
    MailOutlined,
    RocketOutlined,
    TeamOutlined,
    UsergroupAddOutlined,
    EditOutlined,
    UserAddOutlined,
    UserDeleteOutlined,
    } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import { useQueryClient } from "@tanstack/react-query";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { formatStageLabel, formatResourceLabel, formatFundsNeeded } from "../../startupUtils";
import { useJoinStartupMutation, useLeaveStartupMutation } from "../../startupApi";
import { useStartupByIdQuery } from "../hooks";

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
            await joinMutation.mutateAsync(id!);
            await queryClient.invalidateQueries({ queryKey: ["StartupById"] });
            message.success("You joined this startup!");
        } catch {
            message.error("Failed to join startup");
        }
    };

    const handleLeave = async () => {
        try {
            await leaveMutation.mutateAsync(id!);
            await queryClient.invalidateQueries({ queryKey: ["StartupById"] });
            message.success("You left this startup");
        } catch {
            message.error("Failed to leave startup");
        }
    };

    return (
        <Loader query={startup}>
            {(data) => {
                const s = data.Startup;
                const imageUrl = s?.image?.url || s?.identity?.image?.url;
                const startupIdentity = s?.identity?.name ? {
                    id: s.identity.id,
                    name: s.identity.name,
                } : undefined;
                const avatarSize = md ? 120 : 64;
                const involvedUsers = s?.involvedUsers || [];
                const isInvolved = userId
                    ? involvedUsers.some((u) => u.id === userId)
                    : false;
                const isOwner = userId && (s?.createdBy as { id?: string } | null)?.id === userId;

                return (
                    <div>
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageUrl && (
                                <Avatar
                                    shape="circle"
                                    size={avatarSize}
                                    src={`${BACKEND_URL}${imageUrl}`}
                                />
                            )}
                            <Typography.Title level={1} className="EntityDetail__title">
                                <Flex justify="space-between" align="center" gap="16px" wrap>
                                    <Space>
                                        <RocketOutlined />
                                        {s?.title}
                                    </Space>
                                    <Flex gap={8} wrap>
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
                            </Typography.Title>
                        </Flex>
                        {isOwner && (
                            <Link to={`/startups/edit/${id}`}>
                                <Button icon={<EditOutlined />}>Edit</Button>
                            </Link>
                        )}

                        <Divider />

                        <Flex gap={16} wrap className="StartupDetail__meta">
                            {s?.company?.name && (
                                <Tag icon={<TeamOutlined />}>{s.company.name}</Tag>
                            )}
                            {s?.fundsNeeded?.amount != null && (
                                <Tag color="green">
                                    Funds needed: {formatFundsNeeded(s.fundsNeeded.amount, s.fundsNeeded.currency)}
                                </Tag>
                            )}
                            {typeof s?.company?.email === "string" && s.company.email && (
                                <Typography.Link href={`mailto:${s.company.email}`}>
                                    <MailOutlined /> {s.company.email}
                                </Typography.Link>
                            )}
                        </Flex>

                        {(s?.lookingFor?.length || s?.alreadyHave?.length) && (
                            <>
                                <Divider />
                                <Flex gap={24} wrap>
                                    {!!s?.lookingFor?.length && (
                                        <div>
                                            <Typography.Text type="secondary">Looking for:</Typography.Text>
                                            <Flex gap={4} wrap className="StartupDetail__tags">
                                                {s.lookingFor.map((r) => (
                                                    <Tag key={r} color="orange">{formatResourceLabel(r)}</Tag>
                                                ))}
                                            </Flex>
                                        </div>
                                    )}
                                    {!!s?.alreadyHave?.length && (
                                        <div>
                                            <Typography.Text type="secondary">Already have:</Typography.Text>
                                            <Flex gap={4} wrap className="StartupDetail__tags">
                                                {s.alreadyHave.map((r) => (
                                                    <Tag key={r} color="cyan">{formatResourceLabel(r)}</Tag>
                                                ))}
                                            </Flex>
                                        </div>
                                    )}
                                </Flex>
                            </>
                        )}

                        {auth.isAuthenticated && (
                            <>
                                <Divider />
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
                            </>
                        )}

                        <Divider />
                        <Markdown>{s?.description}</Markdown>
                        <Divider />

                        <Tabs
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
                                    label: "Comments",
                                    children: (
                                        <EntityCommentsSection
                                            targetId={id!}
                                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Startups}
                                            title="Comments"
                                        />
                                    ),
                                },
                            ]}
                        />
                    </div>
                );
            }}
        </Loader>
    );
};

export default StartupDetail;
