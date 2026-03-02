import * as React from "react";
import { Link, useParams } from "react-router-dom";
import { Avatar, Button, Divider, Flex, Grid, Tabs, Typography } from "antd";
import { useAuth } from "react-oidc-context";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useCompanyByIdQuery,
    useListJobsByCompanyQuery,
    useListProductsByCompanyQuery,
    useListStartupsByCompanyQuery,
    useListCommentsByTargetQuery,
} from "../../generated/graphql";
import { COMMENT_RELATION_TO_QUERY_RELATION } from "../../constants";
import { Loader } from "../Loader";
import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { CompanyJobsList } from "../lists/CompanyJobsList";
import { CompanyProductsServicesList } from "../lists/CompanyProductsServicesList";
import { CompanyVenturesList } from "../lists/CompanyVenturesList";
import { IdentityGroups } from "./IdentityGroups";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";

const CompanyDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const company = useCompanyByIdQuery({ id: id! });
    const { md } = Grid.useBreakpoint();
    const auth = useAuth();

    const jobsCount = useListJobsByCompanyQuery({ companyId: id!, limit: 1 }, { enabled: !!id });
    const productsCount = useListProductsByCompanyQuery({ companyId: id!, limit: 1 }, { enabled: !!id });
    const venturesCount = useListStartupsByCompanyQuery({ companyId: id!, limit: 1 }, { enabled: !!id });
    const commentsRelation = COMMENT_RELATION_TO_QUERY_RELATION[Comment_ReplyPostRelationshipInputRelationTo.Companies];
    const commentsCount = useListCommentsByTargetQuery(
        { targetId: id!, relationTo: commentsRelation, limit: 1 },
        { enabled: !!id },
    );

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
                const isOwner = auth.user?.profile?.sub && companyData?.createdBy?.id === auth.user.profile.sub;

                return (
                    <Flex flex={1} vertical gap="8px">
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
                                    label: `Jobs (${jobsCount.data?.Jobs?.totalDocs ?? 0})`,
                                    children: <CompanyJobsList companyId={id!} />,
                                },
                                {
                                    key: "products-services",
                                    label: `Products / Services (${productsCount.data?.Products?.totalDocs ?? 0})`,
                                    children: <CompanyProductsServicesList companyId={id!} />,
                                },
                                {
                                    key: "ventures",
                                    label: `Ventures (${venturesCount.data?.Startups?.totalDocs ?? 0})`,
                                    children: <CompanyVenturesList companyId={id!} />,
                                },
                                {
                                    key: "comments",
                                    label: `Comments (${commentsCount.data?.Comments?.totalDocs ?? 0})`,
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
