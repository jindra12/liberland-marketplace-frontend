import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Grid, Typography } from "antd";

import { routes } from "../../routes";
import { CompanyCard } from "../cards/CompanyCard";
import { IdentityCard } from "../cards/IdentityCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";
import { useEndpointContext } from "../EndpointContext";
import {
    useListIdentitiesQuery,
    useListCompaniesQuery,
    useListJobsQuery,
    useListProductsQuery,
    useListStartupsQuery,
    useListPostsQuery,
} from "../hooks";
import { PostList } from "../lists/PostList";
import { SlicePostList } from "../lists/SlicePostList";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

import { MARKET_ACCORDION_POSTS_QUERY_LIMIT, MARKET_ACCORDION_POSTS_REST_OFFSET, MARKET_ACCORDION_POST_SLICES } from "./constants";
import { SyndicationSection } from "./SyndicationSection";
import { isMarketAccordionSectionEnabled } from "./utils";

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
    const postsQuery = useListPostsQuery({
        page: 1,
        limit: MARKET_ACCORDION_POSTS_QUERY_LIMIT,
    });
    const { urls } = useEndpointContext();
    const postItems = postsQuery.data?.Posts?.docs || [];

    const items = [
        {
            key: "posts-top",
            title: "Posts",
            route: routes.posts.route,
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <SlicePostList
                    items={postItems}
                    offset={MARKET_ACCORDION_POST_SLICES[0].offset}
                    limit={MARKET_ACCORDION_POST_SLICES[0].limit}
                    loading={postsQuery.isLoading}
                    className="MarketAccordion__postSection--top"
                />
            ),
            enabled: isMarketAccordionSectionEnabled(postsQuery, postItems.length, 1),
        },
        {
            key: "products",
            title: "Products",
            route: routes.productsServices.route,
            titleClassName: "MarketAccordion__titleLink--products",
            body: (
                <ProductServiceCard
                    items={productsQuery.data?.Products?.docs || []}
                    loading={productsQuery.isLoading}
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                productsQuery,
                productsQuery.data?.Products?.docs?.length ?? 0,
            ),
        },
        {
            key: "jobs",
            title: "Jobs",
            route: routes.jobs.route,
            titleClassName: "MarketAccordion__titleLink--jobs",
            body: <JobCard items={jobsQuery.data?.Jobs?.docs || []} loading={jobsQuery.isLoading} />,
            enabled: isMarketAccordionSectionEnabled(jobsQuery, jobsQuery.data?.Jobs?.docs?.length ?? 0),
        },
        {
            key: "posts-first-middle",
            title: "Posts",
            route: routes.posts.route,
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <SlicePostList
                    items={postItems}
                    offset={MARKET_ACCORDION_POST_SLICES[1].offset}
                    limit={MARKET_ACCORDION_POST_SLICES[1].limit}
                    loading={postsQuery.isLoading}
                    className="MarketAccordion__postSection--firstMiddle"
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                postsQuery,
                postItems.length,
                MARKET_ACCORDION_POST_SLICES[1].offset + 1,
            ),
        },
        {
            key: "companies",
            title: "Companies",
            route: routes.companies.route,
            titleClassName: "MarketAccordion__titleLink--companies",
            body: (
                <CompanyCard
                    items={companiesQuery.data?.Companies?.docs || []}
                    loading={companiesQuery.isLoading}
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                companiesQuery,
                companiesQuery.data?.Companies?.docs?.length ?? 0,
            ),
        },
        {
            key: "posts-second-middle",
            title: "Posts",
            route: routes.posts.route,
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <SlicePostList
                    items={postItems}
                    offset={MARKET_ACCORDION_POST_SLICES[2].offset}
                    limit={MARKET_ACCORDION_POST_SLICES[2].limit}
                    loading={postsQuery.isLoading}
                    className="MarketAccordion__postSection--secondMiddle"
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                postsQuery,
                postItems.length,
                MARKET_ACCORDION_POST_SLICES[2].offset + 1,
            ),
        },
        {
            key: "ventures",
            title: "Ventures",
            route: routes.ventures.route,
            titleClassName: "MarketAccordion__titleLink--ventures",
            body: (
                <StartupCard
                    items={startupsQuery.data?.Startups?.docs || []}
                    loading={startupsQuery.isLoading}
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                startupsQuery,
                startupsQuery.data?.Startups?.docs?.length ?? 0,
            ),
        },
        {
            key: "tribes",
            title: "Tribes",
            route: routes.tribes.route,
            titleClassName: "MarketAccordion__titleLink--tribes",
            body: (
                <IdentityCard
                    items={identitiesQuery.data?.Identities?.docs || []}
                    loading={identitiesQuery.isLoading}
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                identitiesQuery,
                identitiesQuery.data?.Identities?.docs?.length ?? 0,
            ),
        },
        {
            key: "posts-third-middle",
            title: "Posts",
            route: routes.posts.route,
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <SlicePostList
                    items={postItems}
                    offset={MARKET_ACCORDION_POST_SLICES[3].offset}
                    limit={MARKET_ACCORDION_POST_SLICES[3].limit}
                    loading={postsQuery.isLoading}
                    className="MarketAccordion__postSection--thirdMiddle"
                />
            ),
            enabled: isMarketAccordionSectionEnabled(
                postsQuery,
                postItems.length,
                MARKET_ACCORDION_POST_SLICES[3].offset + 1,
            ),
        },
        {
            key: "syndication",
            title: "Syndication",
            route: routes.syndication.route,
            titleClassName: "MarketAccordion__titleLink--syndication",
            body: (
                <SyndicationSection />
            ),
            enabled: urls.length > 1,
        },
        {
            key: "posts-rest",
            title: "Posts",
            route: routes.posts.route,
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <PostList
                    offset={MARKET_ACCORDION_POSTS_REST_OFFSET}
                    className="MarketAccordion__postSection--rest"
                    titleHidden
                />
            ),
            enabled: true,
        },
    ];
    const visibleItems = items.filter((item) => item.enabled);

    return md ? (
        <Flex vertical gap="64px" className="MarketAccordion">
            {visibleItems.map((item) => (
                <AnimatedIn key={item.key}>
                    <section className="MarketAccordion__section">
                        <Flex vertical gap={24} className="MarketAccordion__header">
                            <Link to={item.route} className={`MarketAccordion__titleLink ${item.titleClassName}`}>
                                <Typography.Title
                                    level={2}
                                    className={`MarketAccordion__title${item.title === "Posts" ? " screen-reader-only" : ""}`}
                                >
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
            {visibleItems.map((item) => (
                <AnimatedIn key={item.key}>
                    <section className="MarketAccordionMobile__section">
                        <Flex vertical gap={18} className="MarketAccordionMobile__header">
                            <Link to={item.route} className={`MarketAccordion__titleLink ${item.titleClassName}`}>
                                <Typography.Title
                                    level={2}
                                    className={`MarketAccordion__title${item.title === "Posts" ? " screen-reader-only" : ""}`}
                                >
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
