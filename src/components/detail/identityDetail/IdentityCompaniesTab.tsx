import * as React from "react";

import { useListCompaniesByIdentityQuery } from "../../hooks";
import { CompanyListInternal } from "../../lists/CompanyListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityCompaniesTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const companiesQuery = useListCompaniesByIdentityQuery(
        { identityId: props.identityId, page, limit: 7, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <CompanyListInternal page={page} query={companiesQuery} setPage={setPage} />;
};
