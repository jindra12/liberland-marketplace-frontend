import * as React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Tag, Typography } from "antd";
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
    const [searchParams, setSearchParams] = useSearchParams();
    const tribeParam = searchParams.get("tribe");
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>(
        tribeParam ? [tribeParam] : []
    );
    const allItems = useAccumulatedDocs(props.query.data?.Products?.docs, props.page);
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((product) => {
            const identityId = product.company?.identity?.id;
            return identityId ? selectedIdentityIds.includes(identityId) : false;
        });

    const hasMore = Boolean(props.query.data?.Products?.hasNextPage);
    const isTribeFiltered = selectedIdentityIds.length > 0;

    // Auto-fetch next page when tribe filter yields 0 visible items but more pages exist
    React.useEffect(() => {
        if (isTribeFiltered && items.length === 0 && hasMore && !props.query.isLoading && !props.query.isFetching) {
            props.setPage(props.page + 1);
        }
    }, [isTribeFiltered, items.length, hasMore, props.query.isLoading, props.query.isFetching, props.page, props.setPage]);

    const tribeEndMessage = isTribeFiltered && !hasMore ? (
        <div className="AppList__tribeEnd">
            <Divider />
            <Typography.Title level={4} className="AppList__tribeEndHeading">
                No more results for this Tribe
            </Typography.Title>
            <Button
                type="primary"
                size="large"
                href={window.location.pathname}
            >
                View items from all tribes
            </Button>
        </div>
    ) : undefined;

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={props.query.refetch}
            loading={props.query.isLoading && allItems.length === 0}
            title="Products / Services"
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            endMessage={tribeEndMessage}
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
