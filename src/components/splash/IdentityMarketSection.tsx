import * as React from "react";

import { Link } from "react-router-dom";

import { UsergroupAddOutlined } from "@ant-design/icons";
import { Avatar, Col, Flex, Row, Typography } from "antd";

import { BACKEND_URL } from "../../gqlFetcher";
import { CompanyCard } from "../cards/CompanyCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";
import {
    useListCompaniesByIdentityQuery,
    useListJobsByIdentityQuery,
    useListProductsByIdentityQuery,
    useListStartupsByIdentityQuery,
} from "../hooks";

type IdentityMarketSectionProps = {
    identityId: string;
    identityName: string;
    identityUrl: string;
    identityImageUrl?: string | null;
};
export const IdentityMarketSection: React.FunctionComponent<IdentityMarketSectionProps> = (props) => {
    const companiesQuery = useListCompaniesByIdentityQuery(
        {
            identityId: props.identityId,
            page: 1,
            limit: 3,
            url: props.identityUrl,
        },
        {
            enabled: Boolean(props.identityId),
        },
    );
    const jobsQuery = useListJobsByIdentityQuery(
        {
            identityId: props.identityId,
            page: 1,
            limit: 3,
            url: props.identityUrl,
        },
        {
            enabled: Boolean(props.identityId),
        },
    );
    const productsQuery = useListProductsByIdentityQuery(
        {
            identityId: props.identityId,
            page: 1,
            limit: 3,
            url: props.identityUrl,
        },
        {
            enabled: Boolean(props.identityId),
        },
    );
    const startupsQuery = useListStartupsByIdentityQuery(
        {
            identityId: props.identityId,
            page: 1,
            limit: 3,
        },
        {
            enabled: Boolean(props.identityId),
        },
    );
    const identityHost = React.useMemo(() => {
        try {
            return new URL(props.identityUrl).host;
        } catch {
            return "Syndicated marketplace";
        }
    }, [props.identityUrl]);
    const cardSections = [
        {
            key: "companies",
            hasContent:
                (companiesQuery.data?.Companies?.totalDocs ?? 0) > 0 ||
                (companiesQuery.data?.Companies?.docs?.length ?? 0) > 0,
            loading: companiesQuery.isLoading,
            card: (
                <CompanyCard
                    items={companiesQuery.data?.Companies?.docs || []}
                    loading={companiesQuery.isLoading}
                    totalDocs={companiesQuery.data?.Companies?.totalDocs}
                    identityId={props.identityId}
                />
            ),
        },
        {
            key: "products",
            hasContent:
                (productsQuery.data?.Products?.totalDocs ?? 0) > 0 ||
                (productsQuery.data?.Products?.docs?.length ?? 0) > 0,
            loading: productsQuery.isLoading,
            card: (
                <ProductServiceCard
                    items={productsQuery.data?.Products?.docs || []}
                    loading={productsQuery.isLoading}
                    totalDocs={productsQuery.data?.Products?.totalDocs}
                    identityId={props.identityId}
                />
            ),
        },
        {
            key: "jobs",
            hasContent: (jobsQuery.data?.Jobs?.totalDocs ?? 0) > 0 || (jobsQuery.data?.Jobs?.docs?.length ?? 0) > 0,
            loading: jobsQuery.isLoading,
            card: (
                <JobCard
                    items={jobsQuery.data?.Jobs?.docs || []}
                    loading={jobsQuery.isLoading}
                    totalDocs={jobsQuery.data?.Jobs?.totalDocs}
                    identityId={props.identityId}
                />
            ),
        },
        {
            key: "startups",
            hasContent:
                (startupsQuery.data?.Startups?.totalDocs ?? 0) > 0 ||
                (startupsQuery.data?.Startups?.docs?.length ?? 0) > 0,
            loading: startupsQuery.isLoading,
            card: (
                <StartupCard
                    items={startupsQuery.data?.Startups?.docs || []}
                    loading={startupsQuery.isLoading}
                    totalDocs={startupsQuery.data?.Startups?.totalDocs}
                    identityId={props.identityId}
                />
            ),
        },
    ];
    const visibleCardSections = cardSections.filter((section) => section.loading || section.hasContent);
    if (visibleCardSections.length === 0) {
        return null;
    }
    const desktopSpan = visibleCardSections.length === 1 ? 24 : 12;
    return (
        <div className="SplashPage__identitySection">
            <Link to={`/tribes/${props.identityId}`} className="SplashPage__identityHeadingLink">
                <Flex align="center" gap={14} className="SplashPage__identityHeader">
                    <Avatar
                        size={48}
                        src={props.identityImageUrl ? `${BACKEND_URL}${props.identityImageUrl}` : undefined}
                        icon={!props.identityImageUrl ? <UsergroupAddOutlined /> : undefined}
                        className="SplashPage__identityAvatar"
                    />
                    <Flex vertical gap={2}>
                        <Typography.Title level={3} className="SplashPage__identityHeading">
                            {props.identityName}
                        </Typography.Title>
                        <Typography.Text className="SplashPage__identityMeta">{identityHost}</Typography.Text>
                    </Flex>
                </Flex>
            </Link>
            <Row gutter={[20, 20]} className="SplashPage__cardsGrid">
                {visibleCardSections.map((section) => (
                    <Col key={section.key} xs={24} xl={desktopSpan}>
                        {section.card}
                    </Col>
                ))}
            </Row>
        </div>
    );
};
