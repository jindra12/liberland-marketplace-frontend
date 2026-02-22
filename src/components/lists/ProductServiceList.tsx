import * as React from "react";

import { ProductServiceListInternal } from "./ProductServiceListInternal";
import { useListProductsQuery } from "../hooks";

export const ProductsServicesList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListProductsQuery({
        limit: 10,
        page,
    });

    return (
        <ProductServiceListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
