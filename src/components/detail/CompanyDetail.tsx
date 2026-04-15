import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useParams } from "react-router-dom";

import { EditOutlined, UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Divider, Flex, Grid, Space, Typography } from "antd";

import { Comment_ReplyPostRelationshipInputRelationTo } from "../../generated/graphql";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useCompanyByIdQuery } from "../hooks";
import { CompanyJobsList } from "../lists/CompanyJobsList";
import { CompanyProductsServicesList } from "../lists/CompanyProductsServicesList";
import { CompanyStartupsList } from "../lists/CompanyStartupsList";
import { Loader } from "../Loader";
import { Markdown } from "../Markdown";
import { RouteButton } from "../RouteButton";
import { CompanyContactLinks } from "../shared/CompanyContactLinks";
import { IdentityTagLink } from "../shared/IdentityTagLink";
import { getImage } from "../shared/image/utils";

import { CommonDetail } from "./CommonDetail";
import { IdentityGroups } from "./IdentityGroups";
import { useCompanyTabCounts } from "./useCompanyTabCounts";




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
                const companyIdentity = companyData?.identity?.name
                    ? {
                          id: companyData.identity.id,
                          name: companyData.identity.name,
                      }
                    : undefined;
                const allowedIdentities = companyData?.allowedIdentities || [];
                const disallowedIdentities = companyData?.disallowedIdentities || [];
                const avatarSize = md ? 120 : 72;
                const isOwner = auth.user?.profile?.sub && companyData?.createdBy?.id === auth.user.profile.sub;
                const shareTitle = companyData?.name ?? "Company";
                const shareText = `Check out ${shareTitle} on NSwap.`;

                return (
                    <CommonDetail
                        className="CompanyDetail"
                        serverURL={companyData?.serverURL}
                        backTo="/companies"
                        backLabel="Back to companies"
                        shareLabel="Share this company"
                        shareTitle={shareTitle}
                        shareText={shareText}
                        subscriptionTarget={
                            companyData
                                ? {
                                      collection: "companies",
                                      targetID: companyData.id,
                                      serverURL: companyData.serverURL,
                                      isSubscribed: companyData.isSubscribed,
                                  }
                                : undefined
                        }
                        gap={md ? 18 : 16}
                        header={
                            <Space size={md ? 24 : 16} align="start" className="EntityDetail__header CompanyDetail__header">
                                {imageSrc && <Avatar shape="circle" size={avatarSize} src={imageSrc} />}
                                <Flex vertical gap={md ? 18 : 14} className="EntityDetail__headerBody">
                                    <div className="EntityDetail__titleBlock">
                                        <Typography.Text className="EntityDetail__eyebrow">Company</Typography.Text>
                                        <div className="EntityDetail__titleRow">
                                            <Typography.Title level={1} className="EntityDetail__title">
                                                {companyData?.name}
                                            </Typography.Title>
                                        </div>
                                        {companyIdentity && (
                                            <div className="CompanyDetail__identityRow">
                                                <IdentityTagLink
                                                    identity={companyIdentity}
                                                    color="success"
                                                    icon={<UsergroupAddOutlined />}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </Flex>
                            </Space>
                        }
                        beforeShare={
                            <>
                                {isOwner && (
                                    <RouteButton to={`/companies/edit/${id}`} icon={<EditOutlined />}>
                                        Edit
                                    </RouteButton>
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
                            </>
                        }
                        sections={[
                            {
                                key: "jobs",
                                label: `Jobs (${counts.jobs})`,
                                children: (
                                    <CompanyJobsList companyId={id!} serverUrl={companyData?.serverURL} />
                                ),
                            },
                            {
                                key: "products-services",
                                label: `Products / Services (${counts.products})`,
                                children: (
                                    <CompanyProductsServicesList
                                        companyId={id!}
                                        serverUrl={companyData?.serverURL}
                                    />
                                ),
                            },
                            {
                                key: "startups",
                                label: `Ventures (${counts.startups})`,
                                children: (
                                    <CompanyStartupsList companyId={id!} serverUrl={companyData?.serverURL} />
                                ),
                            },
                            {
                                key: "comments",
                                label: "Discussion",
                                children: (
                                    <EntityCommentsSection
                                        targetId={id!}
                                        relationTo={Comment_ReplyPostRelationshipInputRelationTo.Companies}
                                        serverURL={companyData?.serverURL}
                                    />
                                ),
                            },
                        ]}
                    />
                );
            }}
        </Loader>
    );
};

export default CompanyDetail;
