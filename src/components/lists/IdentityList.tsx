import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Grid, Typography } from "antd";

import { AppList } from "../AppList";
import { useListIdentitiesQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { ListShareDetailButtons } from "../share/ListShareDetailButtons";
import { getImage } from "../shared/image/utils";

export const IdentityList: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
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
            renderItem={{
                title: (identity) => (
                    <Flex align="center" gap={12}>
                        <Link to={`/tribes/${identity.id}`}>
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
                                detailPath={`/tribes/${identity.id}`}
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
                                detailPath={`/tribes/${identity.id}`}
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
                        <Link to={`/tribes/${identity.id}`}>
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
