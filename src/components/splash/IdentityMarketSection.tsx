import * as React from "react";
import { Link } from "react-router-dom";
import { Avatar, Col, Flex, Row, Typography } from "antd";
import { UsergroupAddOutlined } from "@ant-design/icons";
import {
    useListCompaniesByIdentityQuery,
    useListJobsByIdentityQuery,
    useListProductsByIdentityQuery,
    useListStartupsByIdentityQuery,
} from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { CompanyCard } from "../cards/CompanyCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";

type IdentityMarketSectionProps = {
    identityId: string;
    identityName: string;
    identityImageUrl?: string;
};

export const IdentityMarketSection: React.FunctionComponent<IdentityMarketSectionProps> = ({
    identityId,
    identityName,
    identityImageUrl,
}) => {
    const companiesQuery = useListCompaniesByIdentityQuery(
        { identityId, page: 1, limit: 3, sort: "-createdAt" },
        { enabled: Boolean(identityId) }
    );

    const jobsQuery = useListJobsByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
        },
        { enabled: Boolean(identityId) }
    );

    const productsQuery = useListProductsByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
        },
        { enabled: Boolean(identityId) }
    );

    const startupsQuery = useListStartupsByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
        },
        { enabled: Boolean(identityId) }
    );

    return (
        <div className="SplashPage__identitySection">
            <Link to={`/tribes/${identityId}`} className="SplashPage__identityHeadingLink">
                <Flex align="center" gap={12}>
                    <Avatar
                        size={40}
                        src={identityImageUrl ? `${BACKEND_URL}${identityImageUrl}` : undefined}
                        icon={!identityImageUrl ? <UsergroupAddOutlined /> : undefined}
                        className="SplashPage__identityAvatar"
                    />
                    <Typography.Title level={4} className="SplashPage__identityHeading">
                        {identityName}
                    </Typography.Title>
                </Flex>
            </Link>
            <Row gutter={[16, 16]} className="SplashPage__cardsGrid">
                <Col xs={24} xl={12}>
                    <CompanyCard
                        items={companiesQuery.data?.Companies?.docs || []}
                        loading={companiesQuery.isLoading}
                        totalDocs={companiesQuery.data?.Companies?.totalDocs ?? undefined}
                        identityId={identityId}
                    />
                </Col>
                <Col xs={24} xl={12}>
                    <ProductServiceCard
                        items={productsQuery.data?.Products?.docs || []}
                        loading={productsQuery.isLoading}
                        totalDocs={productsQuery.data?.Products?.totalDocs ?? undefined}
                        identityId={identityId}
                    />
                </Col>
                <Col xs={24} xl={12}>
                    <JobCard
                        items={jobsQuery.data?.Jobs?.docs || []}
                        loading={jobsQuery.isLoading}
                        totalDocs={jobsQuery.data?.Jobs?.totalDocs ?? undefined}
                        identityId={identityId}
                    />
                </Col>
                <Col xs={24} xl={12}>
                    <StartupCard
                        items={startupsQuery.data?.Startups?.docs || []}
                        loading={startupsQuery.isLoading}
                        totalDocs={startupsQuery.data?.Startups?.totalDocs ?? undefined}
                        identityId={identityId}
                    />
                </Col>
            </Row>
        </div>
    );
};
