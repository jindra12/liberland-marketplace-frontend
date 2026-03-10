import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Button, Flex, Grid, Tag } from "antd";
import { UseQueryResult } from "@tanstack/react-query";
import { DollarOutlined } from "@ant-design/icons";
import { ListProductsByCompanyQuery, ListProductsQuery } from "../../generated/graphql";
import { AppList } from "../AppList";
import { IdentityFilter } from "../IdentityFilter";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { formatUsdFromCents, getImage, isProductPurchasable, parseActionLink } from "../../utils";
import { AddToCartButton } from "../cart/AddToCartButton";
import { CartItemCount } from "../cart/CartItemCount";

type ProductListQuery = ListProductsQuery | ListProductsByCompanyQuery;
type ProductListItem =
    | NonNullable<NonNullable<ListProductsQuery["Products"]>["docs"]>[number]
    | NonNullable<NonNullable<ListProductsByCompanyQuery["Products"]>["docs"]>[number];

type ProductListSourceQuery = {
    source: "query";
    query: UseQueryResult<ProductListQuery, unknown>;
};

type ProductListSourceStatic = {
    source: "static";
    products: ProductListItem[];
    hasNextPage: boolean;
    isLoading: boolean;
    refetch: () => void | Promise<unknown>;
};

type ProductServiceListInternalProps = {
    setPage: (page: number) => void;
    page: number;
    title?: string;
    showOrderNowFallback?: boolean;
} & (ProductListSourceQuery | ProductListSourceStatic);

export const ProductServiceListInternal: React.FunctionComponent<ProductServiceListInternalProps> = (props) => {
    const screens = Grid.useBreakpoint();
    const addToCartSize = screens.lg ? "large" : "middle";
    const showOrderNowFallback = props.showOrderNowFallback ?? true;
    const [selectedIdentityIds, setSelectedIdentityIds] = React.useState<string[]>([]);
    const allItems = props.source === "query"
        ? (props.query.data?.Products?.docs || [])
        : props.products;
    const items = selectedIdentityIds.length === 0
        ? allItems
        : allItems.filter((product) => {
            const identityId = product.company?.identity?.id;
            return identityId ? selectedIdentityIds.includes(identityId) : false;
        });
    const hasMore = props.source === "query"
        ? props.query.data?.Products?.hasNextPage || false
        : props.hasNextPage;
    const isLoading = props.source === "query"
        ? props.query.isLoading
        : props.isLoading;
    const refetch = props.source === "query"
        ? props.query.refetch
        : props.refetch;
    const handleRefetch = () => {
        refetch();
    };

    return (
        <AppList
            hasMore={hasMore}
            items={items}
            next={() => props.setPage(props.page + 1)}
            refetch={handleRefetch}
            loading={isLoading}
            title={props.title || "Products / Services"}
            filters={<IdentityFilter selectedIds={selectedIdentityIds} onChange={setSelectedIdentityIds} />}
            renderItem={{
                title: (product) => (
                    <Flex justify="space-between" align="center" wrap>
                        <Link to={`/products-services/${product.id}`}>{product.name}</Link>
                        {product.company?.identity?.name && (
                            <IdentityTagLink identity={product.company.identity} color="success" />
                        )}
                    </Flex>
                ),
                actions: (product) => {
                    const orderNowLink = parseActionLink(product.url);
                    const canPurchase = isProductPurchasable(product);
                    return (
                        <Flex align="center" justify="space-between" gap="16px" className="ProductList__actionsRow">
                            <Flex vertical gap="8px">
                                {product.priceInUSDEnabled && product.priceInUSD !== null && product.priceInUSD !== undefined && (
                                    <Tag color="success" icon={<DollarOutlined />}>
                                        {`Price: ${formatUsdFromCents(product.priceInUSD)}`}
                                    </Tag>
                                )}
                                <CartItemCount
                                    productId={product.id}
                                    serverURL={product.serverURL!}
                                />
                            </Flex>
                            {canPurchase ? (
                                <AddToCartButton
                                    productId={product.id}
                                    serverURL={product.serverURL!}
                                    size={addToCartSize}
                                    maxAvailable={product.inventory}
                                />
                            ) : showOrderNowFallback && orderNowLink ? (
                                <Button type="primary" size={addToCartSize} href={orderNowLink}>
                                    Order Now!
                                </Button>
                            ) : null}
                        </Flex>
                    );
                },
                avatar: (product) => product.image?.url ? (
                    <Link to={`/products-services/${product.id}`}>
                        <Avatar
                            shape="square"
                            size={80}
                            src={getImage(product) || getImage(product.company)}
                            className="EntityList__avatar"
                        />
                    </Link>
                ) : undefined,
                description: (product) => (
                    <Markdown className="Markdown--clamp3 EntityList__description">
                        {product.description}
                    </Markdown>
                ),
                body: () => null,
            }}
        />
    );
};
