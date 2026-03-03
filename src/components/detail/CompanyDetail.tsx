import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar,
    Button,
    Divider,
    Flex,
    Grid,
    Tabs,
    Typography
} from "antd";
import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { useAuth } from "react-oidc-context";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { useCompanyTabCounts } from "./useCompanyTabCounts";
import { Loader } from "../Loader";
import { getImage } from "../../utils";
import { Markdown } from "../Markdown";
import { CompanyJobsList } from "../lists/CompanyJobsList";
import { CompanyProductsServicesList } from "../lists/CompanyProductsServicesList";
import { CompanyStartupsList } from "../lists/CompanyStartupsList";
import { IdentityGroups } from "./IdentityGroups";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useCompanyByIdQuery } from "../hooks";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();

    const counts = useCompanyTabCounts(id);

    return (
        <Loader query={company}>
            {(data) => {
                const companyData = data.Company;
                const imageSrc = getImage(companyData);
                const companyIdentity = companyData?.identity?.name ? {
                    id: companyData.identity.id,
                    name: companyData.identity.name,
                } : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];
                const avatarSize = md ? 120 : 64;
                const isOwner = auth.user?.profile?.sub && companyData?.createdBy?.id === auth.user.profile.sub;

                return (
                    <Flex flex={1} vertical gap="8px">
                        <Flex gap="32px" align="center" wrap className="EntityDetail__header">
                            {imageSrc && (
                                <Avatar
                                    shape="circle"
                                    size={avatarSize}
                                    src={imageSrc}
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
                        {isOwner && (
                            <Link to={`/companies/edit/${id}`}>
                                <Button icon={<EditOutlined />}>Edit</Button>
                            </Link>
                        )}
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
                        <Tabs
                            defaultActiveKey="jobs"
                            items={[
                                {
                                    key: "jobs",
                                    label: `Jobs (${counts.jobs})`,
                                    children: <CompanyJobsList companyId={id!} />,
                                },
                                {
                                    key: "products-services",
                                    label: `Products / Services (${counts.products})`,
                                    children: <CompanyProductsServicesList companyId={id!} />,
                                },
                                {
                                    key: "startups",
                                    label: `Ventures (${counts.startups})`,
                                    children: <CompanyStartupsList companyId={id!} />,
                                },
                                {
                                    key: "comments",
                                    label: `Comments (${counts.comments})`,
                                    children: (
                                        <EntityCommentsSection
                                            targetId={id!}
                                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Companies}
                                            title="Comments"
                                        />
                                    ),
                                },
                            ]}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default CompanyDetail;
