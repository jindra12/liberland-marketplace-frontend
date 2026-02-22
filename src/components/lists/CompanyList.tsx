import * as React from "react";

import { CompanyListInternal } from "./CompanyListInternal";
import { useListCompaniesQuery } from "../hooks";

export const CompanyList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListCompaniesQuery({
        limit: 10,
        page,
    });

    return (
        <CompanyListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
