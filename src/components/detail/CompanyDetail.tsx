import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Divider, Flex, Grid, Typography } from "antd";
import { useCompanyByIdQuery } from "../../generated/graphql";
import { Loader } from "../Loader";
import { UsergroupAddOutlined } from "@ant-design/icons";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyJobsList } from "../lists/CompanyJobsList";
import { IdentityGroups } from "./IdentityGroups";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    const { md } = Grid.useBreakpoint();

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
                const avatarSize = md ? 120 : 64;

                return (
                    <div>
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageUrl && (
                                <Avatar
                                    shape="circle"
                                    size={avatarSize}
                                    src={`${BACKEND_URL}${imageUrl}`}
                                />
                            )}
                            <Typography.Title level={1} className="EntityDetail__title">
                                <Flex justify="space-between" align="center" gap="16px" wrap>
                                    {companyData?.name}
                                    {companyIdentity && (
                                        <IdentityTagLink
                                            identity={companyIdentity}
                                            color="success"
                                            icon={<UsergroupAddOutlined />}
                                        />
                                    )}
                                </Flex>
                            </Typography.Title>
                        </Flex>
                        <Divider />
                        <Markdown>{companyData?.description}</Markdown>
                        <Divider />                        
                        <CompanyContactLinks
                            identity={companyIdentity}
                            website={companyData?.website}
                            email={companyData?.email}
                            phone={companyData?.phone}
                            className="EntityDetail__meta"
                        />
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
