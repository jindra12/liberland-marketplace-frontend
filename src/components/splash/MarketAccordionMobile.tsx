import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Typography } from "antd";

import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { useListJobsQuery, useListProductsQuery } from "../hooks";

export const MarketAccordionMobile: React.FunctionComponent = () => {
    const productsQuery = useListProductsQuery({
        page: 1,
        limit: 3,
    });
    const jobsQuery = useListJobsQuery({
        page: 1,
        limit: 3,
    });

    return (
        <Flex vertical gap="72px" className="MarketAccordionMobile">
            <section className="MarketAccordionMobile__section">
                <Flex vertical gap={18} className="MarketAccordionMobile__header">
                    <Link to="/products-services" className="MarketAccordion__titleLink MarketAccordion__titleLink--products">
                        <Typography.Title level={2} className="MarketAccordion__title">
                            Products
                        </Typography.Title>
                    </Link>
                </Flex>
                <ProductServiceCard
                    items={productsQuery.data?.Products?.docs || []}
                    loading={productsQuery.isLoading}
                />
            </section>

            <section className="MarketAccordionMobile__section">
                <Flex vertical gap={18} className="MarketAccordionMobile__header">
                    <Link to="/jobs" className="MarketAccordion__titleLink MarketAccordion__titleLink--jobs">
                        <Typography.Title level={2} className="MarketAccordion__title">
                            Jobs
                        </Typography.Title>
                    </Link>
                </Flex>
                <JobCard items={jobsQuery.data?.Jobs?.docs || []} loading={jobsQuery.isLoading} />
            </section>
        </Flex>
    );
};
