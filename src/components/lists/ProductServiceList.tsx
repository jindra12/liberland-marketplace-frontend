import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Typography } from "antd";
import { useListProductsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";

export const ProductsServicesList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListProductsQuery({
        limit: 10,
        page,
    });
    const items = query.data?.Products?.docs || [];
    
    return (
        <AppList
            hasMore={!query.data?.Products || query.data.Products.hasNextPage}
            items={items}
            next={() => setPage(page + 1)}
            refetch={query.refetch}
            renderItem={{
                title: (product) => product.name,
                actions: (product) => <Link to={`/products-services/${product.id}`}>Details</Link>,
                avatar: (product) => product.image?.url ? <Avatar src={product.image.url} /> : undefined,
                body: (product) => product.url ? <Typography.Link href={product.url}>Order now!</Typography.Link> : undefined,
            }}
        />
    );
};