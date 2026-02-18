import * as React from "react";
import { useListProductsQuery } from "../../generated/graphql";
import { ProductServiceListInternal } from "./ProductServiceListInternal";

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
