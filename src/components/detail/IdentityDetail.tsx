import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Button, Col, Divider, Flex, Row, Space, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { getImage } from "../../utils";
import { Markdown } from "../Markdown";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { CompanyCard } from "../cards/CompanyCard";
import { StartupCard } from "../cards/StartupCard";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";
import { useIdentityByIdQuery, useListCompaniesByIdentityQuery, useListJobsByIdentityQuery, useListProductsByIdentityQuery, useListStartupsByIdentityQuery } from "../hooks";
import { DetailShareSection } from "../share/DetailShareSection";
import { DetailBackButton } from "./DetailBackButton";

const IdentityDetail: React.FunctionComponent = () => {
    const { id } = useParams<{ id: string }>();
    const identity = useIdentityByIdQuery({ id: id! });

    const jobsQuery = useListJobsByIdentityQuery(
        { identityId: id!, page: 1, limit: 3 },
        { enabled: Boolean(id) }
    );
    const productsQuery = useListProductsByIdentityQuery(
        { identityId: id!, page: 1, limit: 3 },
        { enabled: Boolean(id) }
    );
    const companiesQuery = useListCompaniesByIdentityQuery(
        { identityId: id!, page: 1, limit: 3 },
        { enabled: Boolean(id) }
    );
    const startupsQuery = useListStartupsByIdentityQuery(
        { identityId: id!, page: 1, limit: 3 },
        { enabled: Boolean(id) }
    );

    return (
        <Loader query={identity}>
            {(data) => {
                const imageSrc = getImage(data.Identity);
                const shareTitle = data.Identity?.name ?? "Tribe";
                const shareText = `Check out ${shareTitle} on NSwap.`;
                return (
                    <Flex flex={1} vertical gap={12} className="EntityDetail IdentityDetail">
                        <DetailBackButton to="/tribes" label="Back to tribes" />
                        <Space size={16} align="start" className="EntityDetail__header">
                            {imageSrc && (
                                <Avatar
                                    shape="circle"
                                    size={96}
                                    src={imageSrc}
                                />
                            )}
                            <div className="EntityDetail__headerBody">
                                <Typography.Title level={1} className="EntityDetail__title">
                                    {data.Identity?.name}
                                </Typography.Title>
                            </div>
                        </Space>
                        {data.Identity?.website && (
                            <>
                                <Divider />
                                <Button type="primary" href={data.Identity.website} target="_blank" rel="noreferrer">
                                    <GlobalOutlined /> {data.Identity.website}
                                </Button>
                            </>
                        )}
                        <Divider />
                        <Markdown>{data.Identity?.description}</Markdown>
                        <Divider />
                        <Row gutter={[16, 16]}>
                            <Col xs={24} xl={12}>
                                <CompanyCard
                                    items={companiesQuery.data?.Companies?.docs || []}
                                    loading={companiesQuery.isLoading}
                                    totalDocs={companiesQuery.data?.Companies?.totalDocs}
                                    identityId={id}
                                />
                            </Col>
                            <Col xs={24} xl={12}>
                                <ProductServiceCard
                                    items={productsQuery.data?.Products?.docs || []}
                                    loading={productsQuery.isLoading}
                                    totalDocs={productsQuery.data?.Products?.totalDocs}
                                    identityId={id}
                                />
                            </Col>
                            <Col xs={24} xl={12}>
                                <JobCard
                                    items={jobsQuery.data?.Jobs?.docs || []}
                                    loading={jobsQuery.isLoading}
                                    totalDocs={jobsQuery.data?.Jobs?.totalDocs}
                                    identityId={id}
                                />
                            </Col>
                            <Col xs={24} xl={12}>
                                <StartupCard
                                    items={startupsQuery.data?.Startups?.docs || []}
                                    loading={startupsQuery.isLoading}
                                    totalDocs={startupsQuery.data?.Startups?.totalDocs}
                                    identityId={id}
                                />
                            </Col>
                        </Row>
                        <Divider />
                        <DetailShareSection label="Share this tribe" title={shareTitle} text={shareText} />
                        <Divider />
                        <EntityCommentsSection
                            targetId={id!}
                            relationTo={Comment_ReplyPostRelationshipInputRelationTo.Identities}
                        />
                    </Flex>
                );
            }}
        </Loader>
    );
};

export default IdentityDetail;
