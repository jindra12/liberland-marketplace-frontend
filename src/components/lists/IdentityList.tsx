import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Grid, Typography } from "antd";

import { Identity } from "../../generated/graphql";
import { routes } from "../../routes";
import { AppList } from "../AppList";
import { useDislikeIdentityMutation, useLikeIdentityMutation, useListIdentitiesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { getImage } from "../shared/image/utils";

export const IdentityList: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const likeMutation = useLikeIdentityMutation();
    const dislikeMutation = useDislikeIdentityMutation();
    const [page, setPage] = React.useState(1);
    const query = useListIdentitiesQuery({
        limit: 20,
        page,
    });
    const allItems = query.data?.Identities?.docs || [];

    return (
        <AppList
            hasMore={false}
            items={allItems}
            next={() => setPage(page + 1)}
            loading={query.isLoading}
            refetch={query.refetch}
            title="Tribes"
            likeActions={{
                likeMutation,
                dislikeMutation,
            }}
            renderItem={{
                title: (identity) => (
                    <Flex align="center" gap={12}>
                        <Link to={routes.tribes.detail.getLink(identity as Identity)}>
                            <Typography.Title level={3} className="IdentityList__title">
                                {identity.name}
                            </Typography.Title>
                        </Link>
                    </Flex>
                ),
                actions: (identity) =>
                    md ? (
                        <Flex justify="flex-end" gap="12px" wrap className="EntityList__actionsRow">
                            <ListShareDetailButtons
                                detailPath={routes.tribes.detail.getLink(identity as Identity)}
                                title={identity.name}
                                text={`Check out ${identity.name} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "identities",
                                    targetID: identity.id,
                                    serverURL: identity.serverURL,
                                    isSubscribed: identity.isSubscribed,
                                }}
                            />
                        </Flex>
                    ) : (
                        <Flex vertical gap="12px" className="EntityList__actionsRow IdentityList__actionsRow">
                            <ListShareDetailButtons
                                compact
                                detailPath={routes.tribes.detail.getLink(identity as Identity)}
                                title={identity.name}
                                text={`Check out ${identity.name} on NSwap.`}
                                subscriptionTarget={{
                                    collection: "identities",
                                    targetID: identity.id,
                                    serverURL: identity.serverURL,
                                    isSubscribed: identity.isSubscribed,
                                }}
                            />
                        </Flex>
                    ),
                avatar: (identity) =>
                    identity.image?.url ? (
                        <Link to={routes.tribes.detail.getLink(identity as Identity)}>
                            <Avatar src={getImage(identity)} size={md ? 120 : 88} />
                        </Link>
                    ) : undefined,
                description: (identity) => (
                    <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>
                ),
            }}
        />
    );
};
