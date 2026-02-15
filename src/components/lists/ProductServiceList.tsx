import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Typography } from "antd";
import { useListProductsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";

export const ProductsServicesList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const query = useListProductsQuery({
        limit: 10,
        page,
    });
    const allItems = query.data?.Products?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((product) => {
            const identityId = product.company?.identity.id;
            return identityId && selectedIdentityIds.includes(identityId);
        });

    return (
        <AppList
            hasMore={!query.data?.Products || query.data.Products.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            title="Products and Services"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (product) => product.name,
                actions: (product) => <Link to={`/products-services/${product.id}`}>Details</Link>,
                avatar: (product) => product.image?.url ? <Avatar src={`${BACKEND_URL}${product.image.url}`} /> : undefined,
                description: (product) => <Markdown className="Markdown--clamp2 EntityList__description">{product.description}</Markdown>,
                body: (product) => product.url ? <Typography.Link href={product.url}>Order now!</Typography.Link> : undefined,
            }}
        />
    );
};
