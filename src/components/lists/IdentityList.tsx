import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Grid, Typography } from "antd";

import { Identity } from "../../generated/graphql";
import { routes } from "../../routes";
import { AppList } from "../AppList";
import { Markdown } from "../Markdown";
import { getSourceQualifiedEntityKey } from "../query/utils";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { getImage } from "../shared/image/utils";

import { useIdentityListModel } from "./useIdentityListModel";

export const IdentityList: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const model = useIdentityListModel();

    return (
        <AppList
            rowKey={getSourceQualifiedEntityKey}
            hasMore={Boolean(model.query.data?.Identities?.hasNextPage)}
            items={model.items}
            next={model.loadMore}
            loading={model.query.isLoading}
            refetch={model.query.refetch}
            title="Tribes"
            likeActions={{
                likeMutation: model.likeMutation,
                dislikeMutation: model.dislikeMutation,
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
