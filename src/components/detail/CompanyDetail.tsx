import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Divider, Space, Typography } from "antd";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyJobsList } from "../lists/CompanyJobsList";
import { IdentityGroups } from "./IdentityGroups";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    return (
        <Loader query={company}>
            {(data) => {
                const companyData = data.Company;
                const imageUrl = companyData?.image?.url || companyData?.identity?.image?.url;
                const companyIdentity = companyData?.identity?.name ? {
                    id: companyData.identity.id,
                    name: companyData.identity.name,
                } : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];

                return (
                    <div>
                        <Space size={16} align="start" className="EntityDetail__header">
                            {imageUrl && (
                                <Avatar
                                    shape="circle"
                                    size={128}
                                    src={`${BACKEND_URL}${imageUrl}`}
                                />
                            )}
                            <div>
                                <Typography.Title level={1} className="EntityDetail__title">
                                    {companyData?.name}
                                </Typography.Title>
                                <CompanyContactLinks
                                    identity={companyIdentity}
                                    website={companyData?.website}
                                    email={companyData?.email}
                                    phone={companyData?.phone}
                                    className="EntityDetail__meta"
                                    hideWhenEmpty
                                />
                            </div>
                        </Space>
                        <Divider />
                        <Markdown>{companyData?.description}</Markdown>
                        <Divider />
                        <IdentityGroups
                            allowedIdentities={allowedIdentities}
                            disallowedIdentities={disallowedIdentities}
                            className="EntityDetail__identityGroups"
                        />
                        <Divider />
                        <CompanyJobsList companyId={id!} />
                    </div>
                );
            }}
        </Loader>
    );
};

export default CompanyDetail;
