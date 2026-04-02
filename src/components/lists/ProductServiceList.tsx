import * as React from "react";

import { ProductServiceListInternal } from "./ProductServiceListInternal";
import { useListProductsQuery } from "../hooks";

export const ProductsServicesList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const query = useListProductsQuery({
        limit: 20,
        page,
    });

    return <ProductServiceListInternal source="query" page={page} query={query} setPage={setPage} />;
};
