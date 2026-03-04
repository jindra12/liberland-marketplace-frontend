import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Tag } from "antd";
import { UseQueryResult } from "@tanstack/react-query";
import { BankOutlined } from "@ant-design/icons";
import { ListProductsByCompanyQuery, ListProductsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { formatPrice, parseActionLink } from "../../utils";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";

type ProductListQuery = ListProductsQuery | ListProductsByCompanyQuery;

export interface ProductServiceListInternalProps {
    query: UseQueryResult<ProductListQuery, unknown>;
    setPage: (page: number) => void;
    page: number;
}

export const ProductServiceListInternal: React.FunctionComponent<ProductServiceListInternalProps> = (props) => {
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const allItems = useAccumulatedDocs(props.query.data?.Products?.docs, props.page);
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((product) => {
            const identityId = product.company?.identity?.id;
            return identityId ? selectedIdentityIds.includes(identityId) : false;
        });

    return (
        <AppList
            hasMore={Boolean(props.query.data?.Products?.hasNextPage)}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading && allItems.length === 0}
            title="Products / Services"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (product) => (
                    <Flex justify="space-between" align="center" wrap>
                        {product.name}
                        {product.company?.identity?.name && (
                            <IdentityTagLink identity={product.company.identity} color="success" />
                        )}
                    </Flex>
                ),
                actions: (product) => (
                    (() => {
                        const orderLink = parseActionLink(product.url);
                        return (
                            <Flex wrap gap="32px" align="center">
                                <Link to={`/products-services/${product.id}`}>
                                    <Button size="large" className="ActionBtn">Details</Button>
                                </Link>
                                {orderLink && (
                                    <Button
                                        size="large"
                                        type="primary"
                                        href={orderLink}
                                    >
                                        Order now!
                                    </Button>
                                )}
                            </Flex>
                        );
                    })()
                ),
                avatar: (product) => product.image?.url ? (
                    <Link to={`/products-services/${product.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={`${BACKEND_URL}${product.image.url}`}
                            className="EntityList__avatar"
                        />
                    </Link>
                ) : undefined,
                description: (product) => (
                    <Markdown className="Markdown--clamp3 EntityList__description">
                        {product.description}
                    </Markdown>
                ),
                body: (product) => {
                    const price = formatPrice(product.price?.amount, product.price?.currency);
                    return price ? (
                        <>
                            <Tag color="success" icon={<BankOutlined />}>{price}</Tag>
                            <Divider />
                        </>
                    ) : null;
                },
            }}
        />
    );
};
