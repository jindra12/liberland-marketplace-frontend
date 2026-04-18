import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Grid, Typography } from "antd";

import { useListPostsQuery } from "../../generated/graphql";
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
import { PostList } from "../lists/PostList";
import { SlicePostList } from "../lists/SlicePostList";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

import { MARKET_ACCORDION_POSTS_QUERY_LIMIT, MARKET_ACCORDION_POSTS_REST_OFFSET, MARKET_ACCORDION_POST_SLICES } from "./constants";

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
        sort: "-contentRankScore",
    });
    const postItems = postsQuery.data?.Posts?.docs || [];

    const items = [
        {
            key: "posts-top",
            title: "Posts",
            route: "/posts",
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
        },
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
        },
        {
            key: "jobs",
            title: "Jobs",
            route: "/jobs",
            titleClassName: "MarketAccordion__titleLink--jobs",
            body: <JobCard items={jobsQuery.data?.Jobs?.docs || []} loading={jobsQuery.isLoading} />,
        },
        {
            key: "posts-first-middle",
            title: "Posts",
            route: "/posts",
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
        },
        {
            key: "companies",
            title: "Companies",
            route: "/companies",
            titleClassName: "MarketAccordion__titleLink--companies",
            body: <CompanyCard items={companiesQuery.data?.Companies?.docs || []} loading={companiesQuery.isLoading} />,
        },
        {
            key: "posts-second-middle",
            title: "Posts",
            route: "/posts",
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
            body: (
                <IdentityCard
                    items={identitiesQuery.data?.Identities?.docs || []}
                    loading={identitiesQuery.isLoading}
                />
            ),
        },
        {
            key: "posts-third-middle",
            title: "Posts",
            route: "/posts",
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
            isMobile: true,
        },
        {
            key: "posts-rest",
            title: "Posts",
            route: "/posts",
            titleClassName: "MarketAccordion__titleLink--posts",
            body: (
                <PostList
                    offset={MARKET_ACCORDION_POSTS_REST_OFFSET}
                    className="MarketAccordion__postSection--rest"
                    titleHidden
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
            {items.filter(({ isMobile }) => isMobile).map((item) => (
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
