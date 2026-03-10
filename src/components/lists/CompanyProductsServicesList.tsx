import * as React from "react";

import { ProductServiceListInternal } from "./ProductServiceListInternal";
import { useListProductsByCompanyQuery } from "../hooks";

export interface CompanyProductsServicesListProps {
    companyId: string;
};

export const CompanyProductsServicesList: React.FunctionComponent<CompanyProductsServicesListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListProductsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 10,
    });

    return (
        <ProductServiceListInternal
            source="query"
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
