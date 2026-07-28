import * as React from "react";

import { useListCompaniesQuery } from "../hooks";

import { CompanyListInternal } from "./CompanyListInternal";

export const CompanyList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const query = useListCompaniesQuery({
        limit: 20,
        page,
    });

    return <CompanyListInternal page={page} query={query} setPage={setPage} />;
};
