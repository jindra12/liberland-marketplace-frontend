import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Space, Tag, message } from "antd";
import { RocketOutlined, UsergroupAddOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { AppList } from "../AppList";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListStartupsQuery } from "../../generated/graphql";
import { formatStageLabel, formatResourceLabel } from "../../startupUtils";
import { useJoinStartupMutation, useLeaveStartupMutation } from "../../startupApi";
import { getImage } from "../../utils";

type StartupDoc = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];

const InvolvementButton: React.FunctionComponent<{ startup: StartupDoc; refetch: () => void }> = ({ startup, refetch }) => {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const joinMutation = useJoinStartupMutation();
    const leaveMutation = useLeaveStartupMutation();
    const userId = auth.user?.profile?.sub;

    if (!auth.isAuthenticated) return null;

    const isInvolved = userId
        ? startup.involvedUsers?.some((u) => u.id === userId) ?? false
        : false;

    const handleJoin = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await joinMutation.mutateAsync({
                startupId: startup.id,
                url: startup.serverURL!,
            });
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You joined this startup!");
        } catch {
            message.error("Failed to join startup");
        }
    };

    const handleLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await leaveMutation.mutateAsync({
                startupId: startup.id,
                url: startup.serverURL!,
            });
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You left this startup");
        } catch {
            message.error("Failed to leave startup");
        }
    };

    if (isInvolved) {
        return (
            <Button
                icon={<UserDeleteOutlined />}
                onClick={handleLeave}
                loading={leaveMutation.isPending}
                size="large"
            >
                Remove Involvement
            </Button>
        );
    }

    return (
        <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={handleJoin}
            loading={joinMutation.isPending}
            size="large"
        >
            Get Involved
        </Button>
    );
};

export interface StartupListInternalProps {
    query: UseQueryResult<ListStartupsQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}

export const StartupListInternal: React.FunctionComponent<StartupListInternalProps> = (props) => {
    const allItems = props.query.data?.Startups?.docs || [];

    return (
        <AppList
            hasMore={!props.query.data?.Startups || props.query.data.Startups.hasNextPage}
            items={allItems}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            title="Startups"
            renderItem={{
                title: (startup) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Flex align="center" gap={8}>
                            <RocketOutlined />
                            {startup.title}
                        </Flex>
                        <Flex gap={4} wrap>
                            <Tag color="blue">{formatStageLabel(startup.stage)}</Tag>
                            {startup.identity?.name && (
                                <IdentityTagLink
                                    identity={startup.identity}
                                    color="success"
                                    icon={<UsergroupAddOutlined />}
                                />
                            )}
                        </Flex>
                    </Flex>
                ),
                actions: (startup) => (
                    <Space>
                        <InvolvementButton startup={startup} refetch={props.query.refetch} />
                        <Link to={`/startups/${startup.id}`}>
                            <Button type="primary" variant="filled" className="ActionBtn" size="large">Details</Button>
                        </Link>
                    </Space>
                ),
                avatar: (startup) => startup.image?.url ? (
                    <Link to={`/startups/${startup.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={getImage(startup) || getImage(startup?.company)}
                            className="EntityList__avatar"
                        />
                    </Link>
                ) : undefined,
                description: (startup) => (
                    <Flex gap={4} wrap className="StartupList__meta">
                        {startup.company?.name && (
                            <Tag>{startup.company.name}</Tag>
                        )}
                        {startup.lookingFor?.map((r) => (
                            <Tag key={r} color="orange">{formatResourceLabel(r)}</Tag>
                        ))}
                    </Flex>
                ),
                body: (startup) => (
                    <Markdown className="Markdown--clamp3 EntityList__description">{startup.description}</Markdown>
                ),
            }}
        />
    );
};
