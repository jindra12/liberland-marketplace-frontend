import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Typography } from "antd";
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
            const identityId = product.company?.identity?.id;
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
                actions: (product) => (
                    <Flex wrap gap="32px" align="center">
                        <Link to={`/products-services/${product.id}`}><Button size="large" className="ActionBtn">Details</Button></Link>
                        {product.url && <Typography.Link href={product.url}><Button size="large">Order now!</Button></Typography.Link>}
                    </Flex>
                ),
                avatar: (product) => product.image?.url ? (
                    <Avatar
                        shape="square"
                        size={80}
                        src={`${BACKEND_URL}${product.image.url}`}
                        className="EntityList__avatar"
                    />
                ) : undefined,
                description: (product) => <Markdown className="Markdown--clamp3 EntityList__description">{product.description}</Markdown>,
            }}
        />
    );
};
