import * as React from "react";

import { Link } from "react-router-dom";

import { Flex, Grid, Typography } from "antd";

import { routes } from "../../routes";
import { CompanyCard } from "../cards/CompanyCard";
import { IdentityCard } from "../cards/IdentityCard";
import { JobCard } from "../cards/JobCard";
import { ProductServiceCard } from "../cards/ProductServiceCard";
import { StartupCard } from "../cards/StartupCard";
import { PostListInternal } from "../lists/PostListInternal";
import { SlicePostList } from "../lists/SlicePostList";
import { AnimatedIn } from "../shared/AnimatedIn/AnimatedIn";

import { MARKET_ACCORDION_POST_SLICES } from "./constants";
import { SyndicationSection } from "./SyndicationSection";
import type { MarketSection } from "./types";
import { useMarketAccordion } from "./useMarketAccordion";
import { isMarketAccordionSectionEnabled } from "./utils";

export const MarketAccordion: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const model = useMarketAccordion();
    const sections = [
        {
            key: "products",
            title: "Products",
            route: routes.productsServices.route,
            body: (
                <ProductServiceCard
                    items={model.products.data?.Products?.docs || []}
                    loading={model.products.isLoading}
                />
            ),
            enabled: isMarketAccordionSectionEnabled(model.products, model.products.data?.Products?.docs?.length ?? 0),
        },
        {
            key: "companies",
            title: "Companies",
            route: routes.companies.route,
            body: (
                <CompanyCard items={model.companies.data?.Companies?.docs || []} loading={model.companies.isLoading} />
            ),
            enabled: isMarketAccordionSectionEnabled(
                model.companies,
                model.companies.data?.Companies?.docs?.length ?? 0,
            ),
        },
        {
            key: "jobs",
            title: "Jobs",
            route: routes.jobs.route,
            body: <JobCard items={model.jobs.data?.Jobs?.docs || []} loading={model.jobs.isLoading} />,
            enabled: isMarketAccordionSectionEnabled(model.jobs, model.jobs.data?.Jobs?.docs?.length ?? 0),
        },
        {
            key: "ventures",
            title: "Ventures",
            route: routes.ventures.route,
            body: <StartupCard items={model.ventures.data?.Startups?.docs || []} loading={model.ventures.isLoading} />,
            enabled: isMarketAccordionSectionEnabled(model.ventures, model.ventures.data?.Startups?.docs?.length ?? 0),
        },
        {
            key: "tribes",
            title: "Tribes",
            route: routes.tribes.route,
            body: <IdentityCard items={model.tribes.data?.Identities?.docs || []} loading={model.tribes.isLoading} />,
            enabled: isMarketAccordionSectionEnabled(model.tribes, model.tribes.data?.Identities?.docs?.length ?? 0),
        },
        {
            key: "syndication",
            title: "Syndication",
            route: routes.syndication.route,
            body: <SyndicationSection />,
            enabled: model.hasSyndication,
        },
    ].filter((section) => section.enabled);

    const postGroups = MARKET_ACCORDION_POST_SLICES.slice(0, Math.max(0, sections.length - 1));
    const restOffset = postGroups.reduce((offset, group) => offset + group.limit, 0);
    const items = sections.flatMap<MarketSection>((section, index) => {
        const group = postGroups[index];
        if (!group || !isMarketAccordionSectionEnabled(model.posts, model.postItems.length, group.offset + 1)) {
            return [section];
        }

        return [
            section,
            {
                key: `posts-${group.key}`,
                title: "Popular posts",
                route: routes.posts.route,
                body: (
                    <SlicePostList
                        items={model.postItems}
                        offset={group.offset}
                        limit={group.limit}
                        loading={model.posts.isLoading}
                        className={group.className}
                    />
                ),
            },
        ];
    });
    const hasMorePosts = Boolean(model.posts.data?.Posts?.hasNextPage);
    const visibleItems = [
        ...items,
        ...(model.postItems.length > restOffset || model.posts.isLoading || hasMorePosts
            ? [
                  {
                      key: "posts-rest",
                      title: "Popular posts",
                      route: routes.posts.route,
                      body: (
                          <PostListInternal
                              items={model.postItems.slice(restOffset)}
                              hasMore={hasMorePosts}
                              loading={model.posts.isLoading}
                              next={model.loadMorePosts}
                              refetch={model.posts.refetch}
                              titleHidden
                          />
                      ),
                  },
              ]
            : []),
    ];
    const firstPostKey = visibleItems.find((item) => item.key.startsWith("posts-"))?.key;

    return (
        <Flex vertical gap={md ? 32 : 24} className={md ? "MarketAccordion" : "MarketAccordionMobile"}>
            {visibleItems.map((item) => (
                <AnimatedIn key={item.key}>
                    <section
                        className={md ? "MarketAccordion__section" : "MarketAccordionMobile__section"}
                        data-section={item.key}
                    >
                        <Flex
                            vertical
                            gap={12}
                            className={md ? "MarketAccordion__header" : "MarketAccordionMobile__header"}
                        >
                            <Link
                                to={item.route}
                                className={`MarketAccordion__titleLink MarketAccordion__titleLink--${item.key.startsWith("posts-") ? "posts" : item.key}`}
                            >
                                <Typography.Title
                                    level={2}
                                    className={`MarketAccordion__title${item.key.startsWith("posts-") && item.key !== firstPostKey ? " screen-reader-only" : ""}`}
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
