import * as React from "react";

import { Link } from "react-router-dom";

import { UseQueryResult } from "@tanstack/react-query";

import { RocketOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Flex, Grid, Tag } from "antd";

import { ListStartupsByIdentityQuery, ListStartupsQuery, Startup } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useIdentityFilter } from "../../hooks/useIdentityFilter";
import { routes } from "../../routes";
import { formatStageLabel, formatResourceLabel } from "../../startupUtils";
import { AppList } from "../AppList";
import { useDislikeVentureMutation, useLikeVentureMutation } from "../hooks";
import { Markdown } from "../Markdown";
import { getSourceQualifiedEntityKey } from "../query/utils";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { StartupInvolvementButton } from "./StartupInvolvementButton";

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
            rowKey={getSourceQualifiedEntityKey}
            loadedCount={allItems.length}
            fetching={props.query.isFetching}
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
                                <StartupInvolvementButton startup={startup} />
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
                            <StartupInvolvementButton startup={startup} block />
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
