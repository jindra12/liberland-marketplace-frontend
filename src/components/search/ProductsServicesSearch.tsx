import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Button, Flex, Tag } from "antd";

import { Post_RelatedPosts_RelationTo } from "../../generated/graphql";
import { useAccumulatedDocs } from "../../hooks/useAccumulatedDocs";
import { useListProductsQuery, useSearchProductsQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import type { RelatedTargetSelection } from "../shared/post/types";
import { formatUsdFromCents } from "../shared/product/utils";

import { SEARCH_DRAWER_SCROLLABLE_ID } from "./constants";
import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchProducts } from "./utils";

export interface ProductsServicesSearchProps {
    onClose: () => void;
    onSelect?: (value: RelatedTargetSelection) => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const [page, setPage] = React.useState(1);
    const defaultProducts = useListProductsQuery({
        limit: 5,
        page: 1,
    });
    const searchedProducts = useSearchProductsQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const searchDocs = useAccumulatedDocs(searchedProducts.data?.Searches?.docs, page);
    const items =
        submittedSearchValue.length > 0
            ? mapSearchProducts(searchDocs)
            : defaultProducts.data?.Products?.docs ?? [];
    const loading =
        submittedSearchValue.length > 0
            ? searchedProducts.isLoading && searchDocs.length === 0
            : defaultProducts.isLoading;
    const hasMore = submittedSearchValue.length > 0 ? Boolean(searchedProducts.data?.Searches?.hasNextPage) : false;
    const handleSelect = (product: { id: string; name?: string | null }) => {
        props.onSelect?.({
            relationTo: Post_RelatedPosts_RelationTo.Products,
            value: product.id,
            label: product.name || "Product",
        });
        props.onClose();
    };

    return (
        <SearchDrawer
            title="Product / Service search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
                setPage(1);
            }}
            placeholder="Search products / services"
        >
            <SearchResultsList
                title={
                    submittedSearchValue.length > 0
                        ? `Search results for "${submittedSearchValue}"`
                        : "Products / Services"
                }
                items={items}
                loading={loading}
                hasMore={hasMore}
                next={() => {
                    setPage((currentPage) => currentPage + 1);
                }}
                refetch={submittedSearchValue.length > 0 ? searchedProducts.refetch : defaultProducts.refetch}
                scrollableTarget={SEARCH_DRAWER_SCROLLABLE_ID}
                emptyText="No matching products / services"
                renderItem={{
                    title: (product) => (
                        <Flex justify="space-between" align="center" wrap>
                            {props.onSelect ? (
                                <Button type="link" onClick={() => handleSelect(product)}>
                                    {product.name}
                                </Button>
                            ) : (
                                <Link to={`/products-services/${product.id}`} onClick={props.onClose}>
                                    {product.name}
                                </Link>
                            )}
                            {product.company?.identity?.name && (
                                <IdentityTagLink identity={product.company.identity} color="success" />
                            )}
                        </Flex>
                    ),
                    avatar: (product) =>
                        product.image?.url ? (
                            props.onSelect ? (
                                <Button type="link" onClick={() => handleSelect(product)}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={getImage(product) || getImage(product.company)}
                                        className="EntityList__avatar"
                                    />
                                </Button>
                            ) : (
                                <Link to={`/products-services/${product.id}`} onClick={props.onClose}>
                                    <Avatar
                                        shape="square"
                                        size={80}
                                        src={getImage(product) || getImage(product.company)}
                                        className="EntityList__avatar"
                                    />
                                </Link>
                            )
                        ) : undefined,
                    body: (product) => (
                        <div className="EntityList__body ProductList__body">
                            {product.priceInUSDEnabled &&
                                product.priceInUSD !== null &&
                                product.priceInUSD !== undefined && (
                                    <Tag color="success">{`Price: ${formatUsdFromCents(product.priceInUSD)}`}</Tag>
                                )}
                            <Markdown className="Markdown--clamp3 EntityList__description">{product.description}</Markdown>
                        </div>
                    ),
                }}
            />
        </SearchDrawer>
    );
};
