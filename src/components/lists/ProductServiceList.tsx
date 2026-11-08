import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListProductsQuery } from "../hooks";

import { ProductServiceListInternal } from "./ProductServiceListInternal";

export const ProductsServicesList: React.FunctionComponent = () => {
    const { page, setPage } = useListPage();
    const query = useListProductsQuery({
        limit: 20,
        page,
    });

    return <ProductServiceListInternal source="query" page={page} query={query} setPage={setPage} />;
};
