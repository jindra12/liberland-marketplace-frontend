import * as React from "react";
import { useListCompaniesByIdentityQuery } from "../../../generated/graphql";
import { Loader } from "../../Loader";
import { CompaniesSubList } from "./CompaniesSubList";

export interface IdentityCompaniesSubListProps {
    identityId: string;
}

export const IdentityCompaniesSubList: React.FunctionComponent<IdentityCompaniesSubListProps> = (props) => {
    const query = useListCompaniesByIdentityQuery({
        identityId: props.identityId,
        page: 1,
        limit: 10,
    });

    return (
        <Loader query={query}>
            {(data) => (
                <CompaniesSubList
                    title="Companies"
                    companies={data.Companies?.docs || []}
                    emptyText="No companies found for this identity"
                />
            )}
        </Loader>
    );
};
