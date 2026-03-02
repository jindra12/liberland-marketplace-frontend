import * as React from "react";
import { useListStartupsByCompanyQuery } from "../../generated/graphql";
import { VentureListInternal } from "./VentureListInternal";

export interface CompanyVenturesListProps {
    companyId: string;
}

export const CompanyVenturesList: React.FunctionComponent<CompanyVenturesListProps> = (props) => {
    const [page, setPage] = React.useState(0);
    const query = useListStartupsByCompanyQuery({
        companyId: props.companyId,
        page,
        limit: 10,
    });

    return (
        <VentureListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
