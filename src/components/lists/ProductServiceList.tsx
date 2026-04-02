import * as React from "react";

import { useListProductsQuery } from "../hooks";

import { ProductServiceListInternal } from "./ProductServiceListInternal";

export const ProductsServicesList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const query = useListProductsQuery({
        limit: 20,
        page,
    });

    return <ProductServiceListInternal source="query" page={page} query={query} setPage={setPage} />;
};
