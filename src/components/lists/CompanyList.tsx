import * as React from "react";
import { useListCompaniesQuery } from "../../generated/graphql";
import { CompanyListInternal } from "./CompanyListInternal";

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
