import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Typography } from "antd";
import { useListIdentitiesQuery } from "../../generated/graphql";
import { AppList } from "../AppList";

export const IdentityList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListIdentitiesQuery({
        limit: 10,
        page,
    });
    const items = query.data?.Identities?.docs || [];
    
    return (
        <AppList
            hasMore={!query.data?.Identities || query.data.Identities.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            renderItem={{
                title: (identity) => identity.name,
                actions: (identity) => <Link to={`/identities/${identity.id}`}>Details</Link>,
                avatar: (identity) => identity.image?.url ? <Avatar src={identity.image.url} /> : undefined,
                body: (identity) => identity.website ? <Typography.Link href={identity.website}>{identity.website}</Typography.Link> : undefined,
            }}
        />
    );
};