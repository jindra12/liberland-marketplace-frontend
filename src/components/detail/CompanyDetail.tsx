import * as React from "react";
import { useParams } from "react-router-dom";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    return (
        <Loader query={company}>
            {(company) => (
                
            )}
        </Loader>
    );
};

export default CompanyDetail;
