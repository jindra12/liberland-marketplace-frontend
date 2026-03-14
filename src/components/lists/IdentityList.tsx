import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Grid, Typography } from "antd";

import { AppList } from "../AppList";
import { TextSearchFilter } from "../TextSearchFilter";
import { Markdown } from "../Markdown";
import { useListIdentitiesQuery } from "../hooks";
import { getImage } from "../../utils";

export const IdentityList: React.FunctionComponent = () => {
    const [searchText, setSearchText] = React.useState("");
    const { md } = Grid.useBreakpoint();
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
                    <Flex align="center" gap={12}>
                        <Link to={`/tribes/${identity.id}`}>
                            <Typography.Title level={3} className="IdentityList__title">
                                {identity.name}
                            </Typography.Title>
                        </Link>
                    </Flex>
                ),
                actions: (identity) => (
                    <Flex justify="flex-end" className="EntityList__actionsRow">
                        <Link to={`/tribes/${identity.id}`}>
                            <Button type="primary" size="small">
                                Details
                            </Button>
                        </Link>
                    </Flex>
                ),
                avatar: (identity) => identity.image?.url ? (
                    <Link to={`/tribes/${identity.id}`}>
                        <Avatar src={getImage(identity)} size={md ? 120 : 88} />
                    </Link>
                ) : undefined,
                description: (identity) => <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>,
            }}
        />
    );
};
