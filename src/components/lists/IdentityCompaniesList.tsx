import * as React from "react";
import { useListCompaniesByIdentityQuery } from "../../generated/graphql";
import { CompaniesAppList } from "./CompaniesAppList";

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
        <CompaniesAppList
            title="Companies"
            items={query.data?.Companies?.docs || []}
            hasMore={!query.data?.Companies || query.data.Companies.hasNextPage}
            next={() => setPage((prev) => prev + 1)}
            refetch={query.refetch}
            emptyText="No companies found for this identity"
        />
    );
};
