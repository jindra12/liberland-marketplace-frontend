import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    return (
        <Loader query={company}>
            {(company) => (
                <Typography.Title level={1}>{company.Company?.name}</Typography.Title>
            )}
        </Loader>
    );
};

export default CompanyDetail;
