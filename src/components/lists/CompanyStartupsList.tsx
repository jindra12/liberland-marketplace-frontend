import * as React from "react";

import { useListStartupsByCompanyQuery } from "../hooks";

import { StartupListInternal } from "./StartupListInternal";

export interface CompanyStartupsListProps {
    companyId: string;
    serverUrl?: string | null;
}

export const CompanyStartupsList: React.FunctionComponent<CompanyStartupsListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListStartupsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 20,
        url: props.serverUrl,
    });

    return <StartupListInternal page={page} query={query} setPage={setPage} />;
};
