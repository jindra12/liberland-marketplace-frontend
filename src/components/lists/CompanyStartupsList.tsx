import * as React from "react";
import { useListStartupsByCompanyQuery } from "../../generated/graphql";
import { StartupListInternal } from "./StartupListInternal";

export interface CompanyStartupsListProps {
    companyId: string;
}

export const CompanyStartupsList: React.FunctionComponent<CompanyStartupsListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListStartupsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 10,
    });

    return (
        <StartupListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
