import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Grid, Typography } from "antd";

import { CompanyCard } from "../cards/CompanyCard";
import { IdentityCard } from "../cards/IdentityCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";
import {
    useListIdentitiesQuery,
    useListCompaniesQuery,
    useListJobsQuery,
    useListProductsQuery,
    useListStartupsQuery,
} from "../hooks";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

export const MarketAccordion: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const companiesQuery = useListCompaniesQuery({
        page: 1,
        limit: 7,
    });
    const jobsQuery = useListJobsQuery({
        page: 1,
        limit: 7,
    });
    const productsQuery = useListProductsQuery({
        page: 1,
        limit: 7,
    });
    const startupsQuery = useListStartupsQuery({
        page: 1,
        limit: 7,
    });
    const identitiesQuery = useListIdentitiesQuery({
        page: 1,
        limit: 7,
    });

    const items = [
        {
            key: "products",
            title: "Products",
            route: "/products-services",
            titleClassName: "MarketAccordion__titleLink--products",
            body: (
                <ProductServiceCard
                    items={productsQuery.data?.Products?.docs || []}
                    loading={productsQuery.isLoading}
                />
            ),
            isMobile: true,
        },
        {
            key: "jobs",
            title: "Jobs",
            route: "/jobs",
            titleClassName: "MarketAccordion__titleLink--jobs",
            body: <JobCard items={jobsQuery.data?.Jobs?.docs || []} loading={jobsQuery.isLoading} />,
            isMobile: true,
        },
        {
            key: "companies",
            title: "Companies",
            route: "/companies",
            titleClassName: "MarketAccordion__titleLink--companies",
            body: <CompanyCard items={companiesQuery.data?.Companies?.docs || []} loading={companiesQuery.isLoading} />,
        },
        {
            key: "ventures",
            title: "Ventures",
            route: "/ventures",
            titleClassName: "MarketAccordion__titleLink--ventures",
            body: <StartupCard items={startupsQuery.data?.Startups?.docs || []} loading={startupsQuery.isLoading} />,
        },
        {
            key: "tribes",
            title: "Tribes",
            route: "/tribes",
            titleClassName: "MarketAccordion__titleLink--tribes",
            isMobile: true,
            body: (
                <IdentityCard
                    items={identitiesQuery.data?.Identities?.docs || []}
                    loading={identitiesQuery.isLoading}
                />
            ),
        },
    ];

    return md ? (
        <Flex vertical gap="64px" className="MarketAccordion">
            {items.map((item) => (
                <AnimatedIn key={item.key}>
                    <section className="MarketAccordion__section">
                        <Flex vertical gap={24} className="MarketAccordion__header">
                            <Link to={item.route} className={`MarketAccordion__titleLink ${item.titleClassName}`}>
                                <Typography.Title level={2} className="MarketAccordion__title">
                                    {item.title}
                                </Typography.Title>
                            </Link>
                        </Flex>
                        {item.body}
                    </section>
                </AnimatedIn>
            ))}
        </Flex>
    ) : (
        <Flex vertical gap="32px" className="MarketAccordionMobile">
            {items.filter(({ isMobile }) => isMobile).map((item) => (
                <AnimatedIn key={item.key}>
                    <section className="MarketAccordionMobile__section">
                        <Flex vertical gap={18} className="MarketAccordionMobile__header">
                            <Link to={item.route} className={`MarketAccordion__titleLink ${item.titleClassName}`}>
                                <Typography.Title level={2} className="MarketAccordion__title">
                                    {item.title}
                                </Typography.Title>
                            </Link>
                        </Flex>
                        {item.body}
                    </section>
                </AnimatedIn>
            ))}
        </Flex>
    );
};
