import * as React from "react";

import { useListPage } from "../../../hooks/useListPage";
import { useListCompaniesByIdentityQuery } from "../../hooks";
import { CompanyListInternal } from "../../lists/CompanyListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityCompaniesTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const { page, setPage } = useListPage(props.identityId, props.serverURL);
    const companiesQuery = useListCompaniesByIdentityQuery(
        { identityId: props.identityId, page, limit: 20, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <CompanyListInternal page={page} query={companiesQuery} setPage={setPage} />;
};
