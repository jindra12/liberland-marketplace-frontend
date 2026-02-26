import * as React from "react";
import {
    Col,
    Row,
    Typography } from "antd";

import { CompanyCard } from "../cards/CompanyCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import {
    useListCompaniesByIdentityQuery,
    useListJobsByIdentityQuery,
    useListProductsByIdentityQuery,
} from "../hooks";

type IdentityMarketSectionProps = {
    identityId: string;
    identityName: string;
    identityUrl: string;
};

export const IdentityMarketSection: React.FunctionComponent<IdentityMarketSectionProps> = ({
    identityId,
    identityName,
    identityUrl,
}) => {
    const companiesQuery = useListCompaniesByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
            sort: "-createdAt",
            url: identityUrl,
        },
        { enabled: Boolean(identityId) }
    );

    const jobsQuery = useListJobsByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
            url: identityUrl,
        },
        { enabled: Boolean(identityId) }
    );

    const productsQuery = useListProductsByIdentityQuery(
        {
            identityId,
            page: 1,
            limit: 3,
            url: identityUrl,
        },
        { enabled: Boolean(identityId) }
    );

    return (
        <div className="SplashPage__identitySection">
            <Typography.Title level={4} className="SplashPage__identityHeading">
                {identityName}
            </Typography.Title>
            <Row gutter={[16, 16]} className="SplashPage__cardsGrid">
                <Col xs={24} xl={8}>
                    <JobCard
                        items={jobsQuery.data?.Jobs?.docs || []}
                        loading={jobsQuery.isLoading}
                    />
                </Col>
                <Col xs={24} xl={8}>
                    <CompanyCard
                        items={companiesQuery.data?.Companies?.docs || []}
                        loading={companiesQuery.isLoading}
                    />
                </Col>
                <Col xs={24} xl={8}>
                    <ProductServiceCard
                        items={productsQuery.data?.Products?.docs || []}
                        loading={productsQuery.isLoading}
                    />
                </Col>
            </Row>
        </div>
    );
};
