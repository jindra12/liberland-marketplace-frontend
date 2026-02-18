import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Typography } from "antd";
import { UseQueryResult } from "@tanstack/react-query";
import { ListProductsByCompanyQuery, ListProductsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";

type ProductListQuery = ListProductsQuery | ListProductsByCompanyQuery;

export interface ProductServiceListInternalProps {
    query: UseQueryResult<ProductListQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
    limited?: boolean;
}

export const ProductServiceListInternal: React.FunctionComponent<ProductServiceListInternalProps> = (props) => {
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const allItems = props.query.data?.Products?.docs || [];
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((product) => {
            const identityId = product.company?.identity?.id;
            return identityId ? selectedIdentityIds.includes(identityId) : false;
        });

    return (
        <AppList
            hasMore={!props.limited && (!props.query.data?.Products || props.query.data.Products.hasNextPage)}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading}
            title="Products / Services"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (product) => product.name,
                actions: (product) => (
                    <Flex wrap gap="32px" align="center">
                        <Link to={`/products-services/${product.id}`}>
                            <Button size="large" className="ActionBtn">Details</Button>
                        </Link>
                        {product.url && (
                            <Typography.Link href={product.url}>
                                <Button size="large" type="primary">Order now!</Button>
                            </Typography.Link>
                        )}
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
                description: (product) => (
                    <Markdown className="Markdown--clamp3 EntityList__description">
                        {product.description}
                    </Markdown>
                ),
            }}
        />
    );
};
