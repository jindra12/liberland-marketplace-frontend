import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Typography } from "antd";
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
    const allItems = query.data?.Identities?.docs || [];

    const sortedItems = React.useMemo(() => {
        const filtered = searchText
            ? allItems.filter((identity) =>
                identity.name.toLowerCase().includes(searchText.toLowerCase())
            )
            : allItems;
        return [...filtered].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0));
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
                        <Typography.Link href={identity.website || "#"}>
                            <Typography.Title level={3} className="IdentityList__title">
                                {identity.name}
                            </Typography.Title>
                        </Typography.Link>
                        <Link to={`/tribes/${identity.id}`}>
                            <Button type="primary" size="small">
                                Details
                            </Button>
                        </Link>
                    </Flex>
                ),
                avatar: (identity) => identity.image?.url ? (
                    <Link to={`/tribes/${identity.id}`}>
                        <Avatar src={`${BACKEND_URL}${identity.image.url}`} size={120} />
                    </Link>
                ) : undefined,
                description: (identity) => <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>,
            }}
        />
    );
};
