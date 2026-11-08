import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListProductsByCompanyQuery } from "../hooks";

import { ProductServiceListInternal } from "./ProductServiceListInternal";

export interface CompanyProductsServicesListProps {
    companyId: string;
    serverUrl?: string | null;
}

export const CompanyProductsServicesList: React.FunctionComponent<CompanyProductsServicesListProps> = (props) => {
    const { page, setPage } = useListPage(props.companyId, props.serverUrl);
    const query = useListProductsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
        url: props.serverUrl,
    });

    return <ProductServiceListInternal source="query" page={page} query={query} setPage={setPage} />;
};
