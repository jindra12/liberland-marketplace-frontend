import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Typography } from "antd";
import { useQueries } from "@tanstack/react-query";
import {
    useListIdentitiesQuery,
    useListJobsByIdentityQuery,
    useListProductsByIdentityQuery,
    useListCompaniesByIdentityQuery,
    useListStartupsByIdentityQuery,
} from "../../generated/graphql";
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

    const countQueries = useQueries({
        queries: allItems.flatMap((identity) => [
            {
                queryKey: useListJobsByIdentityQuery.getKey({ identityId: identity.id, page: 1, limit: 1 }),
                queryFn: useListJobsByIdentityQuery.fetcher({ identityId: identity.id, page: 1, limit: 1 }),
            },
            {
                queryKey: useListProductsByIdentityQuery.getKey({ identityId: identity.id, page: 1, limit: 1 }),
                queryFn: useListProductsByIdentityQuery.fetcher({ identityId: identity.id, page: 1, limit: 1 }),
            },
            {
                queryKey: useListCompaniesByIdentityQuery.getKey({ identityId: identity.id, page: 1, limit: 1 }),
                queryFn: useListCompaniesByIdentityQuery.fetcher({ identityId: identity.id, page: 1, limit: 1 }),
            },
            {
                queryKey: useListStartupsByIdentityQuery.getKey({ identityId: identity.id, page: 1, limit: 1 }),
                queryFn: useListStartupsByIdentityQuery.fetcher({ identityId: identity.id, page: 1, limit: 1 }),
            },
        ]),
    });

    const sortedItems = React.useMemo(() => {
        const counts: Record<string, number> = {};
        for (let i = 0; i < allItems.length; i++) {
            const base = i * 4;
            const jobsCount = (countQueries[base]?.data as any)?.Jobs?.totalDocs || 0;
            const productsCount = (countQueries[base + 1]?.data as any)?.Products?.totalDocs || 0;
            const companiesCount = (countQueries[base + 2]?.data as any)?.Companies?.totalDocs || 0;
            const startupsCount = (countQueries[base + 3]?.data as any)?.Startups?.totalDocs || 0;
            counts[allItems[i].id] = jobsCount + productsCount + companiesCount + startupsCount;
        }
        const filtered = searchText
            ? allItems.filter((identity) =>
                identity.name.toLowerCase().includes(searchText.toLowerCase())
            )
            : allItems;
        return [...filtered].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0));
    }, [allItems, countQueries, searchText]);

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
