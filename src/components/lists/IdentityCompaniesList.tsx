import * as React from "react";
import { useListCompaniesByIdentityQuery } from "../../generated/graphql";
import { CompanyListInternal } from "./CompanyListInternal";

type IdentityCompaniesListProps = {
    identityId: string;
};

export const IdentityCompaniesList: React.FunctionComponent<IdentityCompaniesListProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const query = useListCompaniesByIdentityQuery({
        identityId: props.identityId,
        page,
        limit: 10,
    });

    return (
        <CompanyListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
