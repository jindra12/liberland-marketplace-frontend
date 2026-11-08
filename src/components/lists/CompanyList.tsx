import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListCompaniesQuery } from "../hooks";

import { CompanyListInternal } from "./CompanyListInternal";

export const CompanyList: React.FunctionComponent = () => {
    const { page, setPage } = useListPage();
    const query = useListCompaniesQuery({
        limit: 20,
        page,
    });

    return <CompanyListInternal page={page} query={query} setPage={setPage} />;
};
