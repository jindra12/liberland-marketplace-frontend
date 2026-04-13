import * as React from "react";

import { useListProductsByIdentityQuery } from "../../hooks";
import { ProductServiceListInternal } from "../../lists/ProductServiceListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityProductsTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const productsQuery = useListProductsByIdentityQuery(
        { identityId: props.identityId, page, limit: 7, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return (
        <ProductServiceListInternal source="query" page={page} query={productsQuery} setPage={setPage} />
    );
};
