import * as React from "react";

import { Link } from "react-router-dom";

import { Collapse, Typography } from "antd";

import { CompanyCard } from "../cards/CompanyCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";
import {
    useListCompaniesQuery,
    useListJobsQuery,
    useListProductsQuery,
    useListStartupsQuery,
} from "../hooks";

export const MarketAccordion: React.FunctionComponent = () => {
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

    const items = [
        {
            key: "products",
            title: "Products",
            route: "/products-services",
            body: (
                <ProductServiceCard
                    items={productsQuery.data?.Products?.docs || []}
                    loading={productsQuery.isLoading}
                />
            ),
        },
        {
            key: "jobs",
            title: "Jobs",
            route: "/jobs",
            body: <JobCard items={jobsQuery.data?.Jobs?.docs || []} loading={jobsQuery.isLoading} />,
        },
        {
            key: "companies",
            title: "Companies",
            route: "/companies",
            body: <CompanyCard items={companiesQuery.data?.Companies?.docs || []} loading={companiesQuery.isLoading} />,
        },
        {
            key: "ventures",
            title: "Ventures",
            route: "/ventures",
            body: <StartupCard items={startupsQuery.data?.Startups?.docs || []} loading={startupsQuery.isLoading} />,
        },
    ];

    return (
        <Collapse
            accordion
            bordered={false}
            defaultActiveKey={items[0]?.key}
            className="MarketAccordion"
            expandIconPosition="end"
            items={items.map((item) => ({
                key: item.key,
                label: (
                    <Link to={item.route} className="MarketAccordion__titleLink">
                        <Typography.Title level={4} className="MarketAccordion__title">
                            {item.title}
                        </Typography.Title>
                    </Link>
                ),
                children: item.body,
                collapsible: "icon" as const,
            }))}
        />
    );
};
