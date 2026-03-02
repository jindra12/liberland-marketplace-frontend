import * as React from "react";
import { useParams } from "react-router-dom";
import { Avatar, Button, Col, Divider, Flex, Row, Space, Typography } from "antd";
import { GlobalOutlined } from "@ant-design/icons";
import {
    Comment_ReplyPostRelationshipInputRelationTo,
    useIdentityByIdQuery,
    useListCompaniesByIdentityQuery,
    useListJobsByIdentityQuery,
    useListProductsByIdentityQuery,
    useListStartupsByIdentityQuery,
} from "../../generated/graphql";
import { Loader } from "../Loader";
import { BACKEND_URL } from "../../gqlFetcher";
import { Markdown } from "../Markdown";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { CompanyCard } from "../cards/CompanyCard";
import { VentureCard } from "../cards/VentureCard";
import { EntityCommentsSection } from "../comments/EntityCommentsSection";

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
    const venturesQuery = useListStartupsByIdentityQuery(
        { identityId: id!, page: 1, limit: 3 },
        { enabled: Boolean(id) }
    );

    return (
        <Loader query={identity}>
            {(data) => (
                <Flex flex={1} vertical gap="8px">
                    <Space size={16} align="start" className="EntityDetail__header">
                        {data.Identity?.image?.url && (
                            <Avatar
                                shape="circle"
                                size={96}
                                src={`${BACKEND_URL}${data.Identity.image.url}`}
                            />
                        )}
                        <div>
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
                            <JobCard
                                items={jobsQuery.data?.Jobs?.docs || []}
                                loading={jobsQuery.isLoading}
                            />
                        </Col>
                        <Col xs={24} xl={12}>
                            <ProductServiceCard
                                items={productsQuery.data?.Products?.docs || []}
                                loading={productsQuery.isLoading}
                            />
                        </Col>
                        <Col xs={24} xl={12}>
                            <CompanyCard
                                items={companiesQuery.data?.Companies?.docs || []}
                                loading={companiesQuery.isLoading}
                            />
                        </Col>
                        <Col xs={24} xl={12}>
                            <VentureCard
                                items={venturesQuery.data?.Startups?.docs || []}
                                loading={venturesQuery.isLoading}
                            />
                        </Col>
                    </Row>
                    <Divider />
                    <EntityCommentsSection
                        targetId={id!}
                        relationTo={Comment_ReplyPostRelationshipInputRelationTo.Identities}
                        title="Comments"
                    />
                </Flex>
            )}
        </Loader>
    );
};

export default IdentityDetail;
