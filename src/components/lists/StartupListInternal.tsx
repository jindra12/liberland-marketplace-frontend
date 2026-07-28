import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Link } from "react-router-dom";

import { UseQueryResult, useQueryClient } from "@tanstack/react-query";

import { RocketOutlined, UsergroupAddOutlined, UserAddOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Avatar, Button, Flex, Grid, Tag, message } from "antd";

import { ListStartupsByIdentityQuery, ListStartupsQuery, Startup } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useIdentityFilter } from "../../hooks/useIdentityFilter";
import { routes } from "../../routes";
import { formatStageLabel, formatResourceLabel, invalidateStartupQueries } from "../../startupUtils";
import { AppList } from "../AppList";
import {
    useDislikeVentureMutation,
    useJoinStartupMutation,
    useLeaveStartupMutation,
    useLikeVentureMutation,
} from "../hooks";
import { Markdown } from "../Markdown";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

type StartupDoc = NonNullable<NonNullable<ListStartupsQuery["Startups"]>["docs"]>[number];
const InvolvementButton: React.FunctionComponent<{
    startup: StartupDoc;
    refetch: () => void;
    block?: boolean;
}> = (props) => {
    const auth = useAuth();
    const queryClient = useQueryClient();
    const joinMutation = useJoinStartupMutation();
    const leaveMutation = useLeaveStartupMutation();
    const userId = auth.user?.profile?.sub;
    if (!auth.isAuthenticated) return null;
    const isInvolved = userId ? (props.startup.involvedUsers?.some((u) => u.id === userId) ?? false) : false;
    const handleJoin = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await joinMutation.mutateAsync({
                id: props.startup.id,
                url: props.startup.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            await props.refetch();
            message.success("You joined this venture!");
        } catch (error) {
            console.error(error);
            message.error("Failed to join venture");
        }
    };
    const handleLeave = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await leaveMutation.mutateAsync({
                id: props.startup.id,
                url: props.startup.serverURL!,
            });
            await invalidateStartupQueries(queryClient);
            await props.refetch();
            message.success("You left this venture");
        } catch (error) {
            console.error(error);
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
                block={props.block}
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
            block={props.block}
        >
            Get Involved
        </Button>
    );
};
export interface StartupListInternalProps {
    query: UseQueryResult<ListStartupsQuery | ListStartupsByIdentityQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}
export const StartupListInternal: React.FunctionComponent<StartupListInternalProps> = (props) => {
    const { md } = Grid.useBreakpoint();
    const likeMutation = useLikeVentureMutation();
    const dislikeMutation = useDislikeVentureMutation();
    const allItems = useAccumulatedDocs(props.query.data?.Startups?.docs, props.page);
    const { items, hasMore, endMessage, filterNode } = useIdentityFilter({
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
            likeActions={{
                likeMutation,
                dislikeMutation,
            }}
            renderItem={{
                title: (startup) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Flex align="center" gap={8}>
                            <RocketOutlined />
                            <Link to={routes.ventures.detail.getLink(startup as Startup)}>{startup.title}</Link>
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
                actions: (startup) =>
                    md ? (
                        <Flex justify="flex-end" className="EntityList__actionsRow">
                            <Flex wrap gap="12px" align="center">
                                <ListShareDetailButtons
                                    detailPath={routes.ventures.detail.getLink(startup as Startup)}
                                    title={startup.title}
                                    text={`Check out ${startup.title} on NSwap.`}
                                    subscriptionTarget={{
                                        collection: "startups",
                                        targetID: startup.id,
                                        serverURL: startup.serverURL,
                                        isSubscribed: startup.isSubscribed,
                                    }}
                                />
                                <InvolvementButton startup={startup} refetch={props.query.refetch} />
                            </Flex>
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow StartupList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={routes.ventures.detail.getLink(startup as Startup)}
                                title={startup.title}
                                text={`Check out ${startup.title} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "startups",
                                    targetID: startup.id,
                                    serverURL: startup.serverURL,
                                    isSubscribed: startup.isSubscribed,
                                }}
                            />
                            <InvolvementButton startup={startup} refetch={props.query.refetch} block />
                        </Flex>
                    ),
                avatar: (startup) =>
                    startup.image?.url ? (
                        <Link to={routes.ventures.detail.getLink(startup as Startup)}>
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
                        {startup.company?.name && <Tag>{startup.company.name}</Tag>}
                        {startup.lookingFor?.map((r) => (
                            <Tag key={r} color="orange">
                                {formatResourceLabel(r)}
                            </Tag>
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
