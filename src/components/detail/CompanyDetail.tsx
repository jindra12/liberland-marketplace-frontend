import * as React from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    return (
        <Loader query={company}>
            {(company) => (
                <div>
                    <Typography.Title level={1}>{company.Company?.name}</Typography.Title>
                    <Markdown>{company.Company?.description}</Markdown>
                </div>
            )}
        </Loader>
    );
};

export default CompanyDetail;
