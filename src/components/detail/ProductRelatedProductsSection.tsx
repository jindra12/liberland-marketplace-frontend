import * as React from "react";

import { Typography } from "antd";

import type { ListProductsByCompanyQuery, ProductByIdQuery } from "../../generated/graphql";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { useListProductsByCompanyQuery } from "../hooks";

import { combineUniqueById } from "./utils";

type ProductCardItem = NonNullable<NonNullable<ListProductsByCompanyQuery["Products"]>["docs"]>[number];
type ProductDetailItem = NonNullable<ProductByIdQuery["Product"]>;

type ProductRelatedProductsSectionProps = {
    product: ProductDetailItem;
};

export const ProductRelatedProductsSection: React.FunctionComponent<ProductRelatedProductsSectionProps> = (props) => {
    const relatedProducts = (props.product.relatedProducts || []) as ProductCardItem[];
    const companyProductsQuery = useListProductsByCompanyQuery(
        {
            companyId: props.product.company?.id || "",
            page: 1,
            limit: 10,
            sort: "-contentRankScore",
        },
        {
            enabled: Boolean(props.product.company?.id) && relatedProducts.length < 5,
        },
    );
    const fallbackProducts = (companyProductsQuery.data?.Products?.docs || []) as ProductCardItem[];
    const items = combineUniqueById(relatedProducts, fallbackProducts, 5);

    if (items.length === 0) {
        return null;
    }

    return (
        <>
            <Typography.Title level={4}>Related products</Typography.Title>
            <ProductServiceCard items={items} loading={companyProductsQuery.isLoading && relatedProducts.length < 5} />
        </>
    );
};
