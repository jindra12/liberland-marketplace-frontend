import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Typography } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { useListIdentitiesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { TextSearchFilter } from "../TextSearchFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";

export const IdentityList: React.FunctionComponent = () => {
    const [searchText, setSearchText] = React.useState("");
    const query = useListIdentitiesQuery({
        limit: 100,
        page: 1,
    });
    const allItems = query.data?.Identities?.docs;

    const sortedItems = React.useMemo(() => {
        const filtered = searchText
            ? allItems?.filter((identity) =>
                identity.name.toLowerCase().includes(searchText.toLowerCase())
            )
            : allItems;
        return [...filtered || []].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0));
    }, [allItems, searchText]);

    return (
        <AppList
            hasMore={false}
            items={sortedItems}
            next={() => {}}
            loading={query.isLoading}
            refetch={query.refetch}
            title="Tribes"
            filters={<TextSearchFilter value={searchText} onChange={setSearchText} />}
            renderItem={{
                title: (identity) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Typography.Title level={5} className="IdentityList__title">
                            {identity.name}
                        </Typography.Title>
                    </Flex>
                ),
                avatar: (identity) => (
                    <Link to={`/tribes/${identity.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={identity.image?.url ? `${BACKEND_URL}${identity.image.url}` : undefined}
                            icon={!identity.image?.url ? <UsergroupAddOutlined /> : undefined}
                            className="EntityList__avatar"
                        />
                    </Link>
                ),
                description: (identity) => (
                    <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>
                ),
                actions: (identity) => (
                    <Flex wrap gap={12} align="center">
                        <Link to={`/tribes/${identity.id}`}>
                            <Button size="large" className="ActionBtn">Details</Button>
                        </Link>
                        {identity.website && (
                            <Button size="large" href={identity.website} target="_blank" rel="noopener noreferrer">
                                Website
                            </Button>
                        )}
                    </Flex>
                ),
            }}
        />
    );
};
