import * as React from "react";

import { useListProductsByCompanyQuery } from "../hooks";

import { ProductServiceListInternal } from "./ProductServiceListInternal";

export interface CompanyProductsServicesListProps {
    companyId: string;
}

export const CompanyProductsServicesList: React.FunctionComponent<CompanyProductsServicesListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListProductsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
    });

    return <ProductServiceListInternal source="query" page={page} query={query} setPage={setPage} />;
};
