import * as React from "react";

import { Link } from "react-router-dom";

import { Avatar, Flex, Tag } from "antd";

import { useListProductsQuery, useSearchProductsQuery } from "../hooks";
import { Markdown } from "../Markdown";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";
import { formatUsdFromCents } from "../shared/product/utils";

import { SearchDrawer } from "./SearchDrawer";
import { SearchResultsList } from "./SearchResultsList";
import { mapSearchProducts } from "./utils";

export interface ProductsServicesSearchProps {
    onClose: () => void;
}

export const ProductsServicesSearch: React.FunctionComponent<ProductsServicesSearchProps> = (props) => {
    const [searchValue, setSearchValue] = React.useState("");
    const [submittedSearchValue, setSubmittedSearchValue] = React.useState("");
    const defaultProducts = useListProductsQuery({
        limit: 5,
        page: 1,
    });
    const searchedProducts = useSearchProductsQuery(
        {
            searchTerm: submittedSearchValue,
            limit: 5,
            page: 1,
        },
        {
            enabled: submittedSearchValue.length > 0,
        },
    );
    const items =
        submittedSearchValue.length > 0
            ? mapSearchProducts(searchedProducts.data?.Searches?.docs)
            : defaultProducts.data?.Products?.docs ?? [];
    const loading = submittedSearchValue.length > 0 ? searchedProducts.isLoading : defaultProducts.isLoading;

    return (
        <SearchDrawer
            title="Product / Service search"
            onClose={props.onClose}
            searchValue={searchValue}
            onSearchValueChange={setSearchValue}
            onSubmit={() => {
                setSubmittedSearchValue(searchValue);
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
                refetch={submittedSearchValue.length > 0 ? searchedProducts.refetch : defaultProducts.refetch}
                emptyText="No matching products / services"
                renderItem={{
                    title: (product) => (
                        <Flex justify="space-between" align="center" wrap>
                            <Link to={`/products-services/${product.id}`} onClick={props.onClose}>
                                {product.name}
                            </Link>
                            {product.company?.identity?.name && (
                                <IdentityTagLink identity={product.company.identity} color="success" />
                            )}
                        </Flex>
                    ),
                    avatar: (product) =>
                        product.image?.url ? (
                            <Link to={`/products-services/${product.id}`} onClick={props.onClose}>
                                <Avatar
                                    shape="square"
                                    size={80}
                                    src={getImage(product) || getImage(product.company)}
                                    className="EntityList__avatar"
                                />
                            </Link>
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
