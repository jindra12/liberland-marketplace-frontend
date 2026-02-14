import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Typography } from "antd";
import { useListIdentitiesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { TextSearchFilter } from "../TextSearchFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";

export const IdentityList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const [searchText, setSearchText] = React.useState("");
    const query = useListIdentitiesQuery({
        limit: 10,
        page,
    });
    const allItems = query.data?.Identities?.docs || [];
    const items = searchText
        ? allItems.filter((identity) =>
            identity.name.toLowerCase().includes(searchText.toLowerCase())
        )
        : allItems;

    return (
        <AppList
            hasMore={!query.data?.Identities || query.data.Identities.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            filters={<TextSearchFilter value={searchText} onChange={setSearchText} />}
            renderItem={{
                title: (identity) => identity.name,
                actions: (identity) => <Link to={`/identities/${identity.id}`}>Details</Link>,
                avatar: (identity) => identity.image?.url ? <Avatar src={`${BACKEND_URL}${identity.image.url}`} /> : undefined,
                description: (identity) => <Markdown className="Markdown--clamp2 EntityList__description">{identity.description}</Markdown>,
                body: (identity) => identity.website ? <Typography.Link href={identity.website}>{identity.website}</Typography.Link> : undefined,
            }}
        />
    );
};
