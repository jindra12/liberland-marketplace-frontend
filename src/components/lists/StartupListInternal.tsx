import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Space, Tag, message } from "antd";
import { RocketOutlined, UsergroupAddOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { UseQueryResult, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "react-oidc-context";
import { AppList } from "../AppList";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { ListStartupsQuery } from "../../generated/graphql";
import { formatStageLabel, formatResourceLabel } from "../../startupUtils";
import { useJoinStartupMutation, useLeaveStartupMutation } from "../../startupApi";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useTribeFilter } from "../../hooks/useTribeFilter";

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
            await joinMutation.mutateAsync(startup.id);
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You joined this venture!");
        } catch {
            message.error("Failed to join venture");
        }
    };

    const handleLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await leaveMutation.mutateAsync(startup.id);
            await queryClient.invalidateQueries({ queryKey: ["ListStartups"] });
            refetch();
            message.success("You left this venture");
        } catch {
            message.error("Failed to leave venture");
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
    const allItems = useAccumulatedDocs(props.query.data?.Startups?.docs, props.page);
    const { items, hasMore, endMessage, filterNode } = useTribeFilter({
        allItems,
        hasNextPage: Boolean(props.query.data?.Startups?.hasNextPage),
        getIdentityIds: (startup) => {
            const id = startup.identity?.id;
            return id ? [id] : [];
        },
        isLoading: props.query.isLoading,
        isFetching: props.query.isFetching,
        page: props.page,
        setPage: props.setPage,
    });

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            title="Ventures"
            filters={filterNode}
            endMessage={endMessage}
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
                        <Link to={`/ventures/${startup.id}`}>
                            <Button type="primary" variant="filled" className="ActionBtn" size="large">Details</Button>
                        </Link>
                    </Space>
                ),
                avatar: (startup) => startup.image?.url ? (
                    <Link to={`/ventures/${startup.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={`${BACKEND_URL}${startup.image.url}`}
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
