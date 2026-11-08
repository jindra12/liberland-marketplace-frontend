import * as React from "react";

import { useListPage } from "../../../hooks/useListPage";
import { useListProductsByIdentityQuery } from "../../hooks";
import { ProductServiceListInternal } from "../../lists/ProductServiceListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityProductsTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const { page, setPage } = useListPage(props.identityId, props.serverURL);
    const productsQuery = useListProductsByIdentityQuery(
        { identityId: props.identityId, page, limit: 20, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return (
        <ProductServiceListInternal source="query" page={page} query={productsQuery} setPage={setPage} />
    );
};
