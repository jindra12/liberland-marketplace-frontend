import * as React from "react";
import { Alert, Button, Empty, Flex, Typography } from "antd";
import { Link } from "react-router-dom";

import { SplashSectionsSkeleton } from "./LoadingSkeleton/SplashSectionsSkeleton";
import { IdentityMarketSection } from "./splash/IdentityMarketSection";
import { SyndicationSection } from "./splash/SyndicationSection";
import { useListIdentitiesQuery } from "./hooks";

const routeCards = [
    {
        key: "companies",
        eyebrow: "Companies",
        title: "Profiles and related activity",
        description: "Review company pages, contact links, and the offers connected to each profile.",
        to: "/companies",
    },
    {
        key: "market",
        eyebrow: "Market",
        title: "Products and services",
        description: "Browse orderable listings published by participating companies.",
        to: "/products-services",
    },
    {
        key: "jobs",
        eyebrow: "Jobs",
        title: "Open roles and hiring pages",
        description: "Find published jobs with company context and direct detail pages.",
        to: "/jobs",
    },
    {
        key: "ventures",
        eyebrow: "Ventures",
        title: "Startup and venture listings",
        description: "Explore emerging projects shared by tribes, founders, and companies.",
        to: "/ventures",
    },
    {
        key: "tribes",
        eyebrow: "Tribes",
        title: "Identity groups and ecosystems",
        description: "See how companies, jobs, products, and ventures cluster around communities.",
        to: "/tribes",
    },
];

const Splash: React.FunctionComponent = () => {
    const identitiesQuery = useListIdentitiesQuery({
        page: 1,
        limit: 100,
        sort: "name",
    });
    const identities = identitiesQuery.data?.Identities?.docs;
    const isLoading = identitiesQuery.isLoading;
    const hasError = Boolean(identitiesQuery.error);

    const sortedIdentities = React.useMemo(
        () => [...identities || []].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0)),
        [identities],
    );

    return (
        <Flex vertical gap={24} className="SplashPage">
            <section className="SplashPage__hero">
                <Flex vertical align="center" gap={18} className="SplashPage__heroInner">
                    <span className="SplashPage__eyebrow">Beacon Catalogue</span>
                    <Typography.Title level={1} className="SplashPage__heroTitle">
                        Discover <span className="SplashPage__heroAccent">companies, jobs, products</span> and ventures.
                    </Typography.Title>
                    <Typography.Paragraph className="SplashPage__heroDescription">
                        Tribe-first marketplace. Browse company profiles, orderable market listings, published jobs,
                        venture pages, and active tribes across syndicated endpoints.
                    </Typography.Paragraph>
                    <Flex wrap justify="center" gap={12} className="SplashPage__heroActions">
                        <Link to="/products-services">
                            <Button type="primary" size="large">Explore market</Button>
                        </Link>
                        <Link to="/tribes">
                            <Button size="large">Browse tribes</Button>
                        </Link>
                    </Flex>
                    <Flex wrap justify="center" gap={10} className="SplashPage__routePills">
                        <Link to="/companies" className="SplashPage__routePill">Companies <span>profiles</span></Link>
                        <Link to="/products-services" className="SplashPage__routePill">Market <span>orderable</span></Link>
                        <Link to="/jobs" className="SplashPage__routePill">Jobs <span>published</span></Link>
                        <Link to="/ventures" className="SplashPage__routePill">Ventures <span>startup</span></Link>
                        <Link to="/tribes" className="SplashPage__routePill">Tribes <span>identity</span></Link>
                    </Flex>
                    <Flex wrap gap={16} justify="center" className="SplashPage__summaryGrid">
                        {routeCards.map((card) => (
                            <Link key={card.key} to={card.to} className="SplashPage__summaryCard">
                                <span className="SplashPage__summaryEyebrow">{card.eyebrow}</span>
                                <Typography.Title level={4} className="SplashPage__summaryTitle">
                                    {card.title}
                                </Typography.Title>
                                <Typography.Paragraph className="SplashPage__summaryDescription">
                                    {card.description}
                                </Typography.Paragraph>
                            </Link>
                        ))}
                    </Flex>
                </Flex>
            </section>

            <Flex vertical gap={20} className="SplashPage__sections">
                {hasError && (
                    <Alert
                        type="error"
                        showIcon
                        message="Failed to load tribes"
                        description="Try refreshing the page."
                    />
                )}

                {!hasError && !identities?.length && isLoading && (
                    <div className="SplashPage__loading">
                        <SplashSectionsSkeleton />
                    </div>
                )}

                {!hasError && !identities?.length && !isLoading && (
                    <Empty description="No tribes found yet." />
                )}

                {sortedIdentities.length > 0 && (
                    <Flex vertical gap={24} className="SplashPage__identityList">
                        {sortedIdentities.map((identity, index) => (
                            <IdentityMarketSection
                                key={identity.id + identity.serverURL! + index}
                                identityId={identity.id}
                                identityName={identity.name || "Tribe"}
                                identityUrl={identity.serverURL!}
                                identityImageUrl={identity.image?.url}
                            />
                        ))}
                    </Flex>
                )}

                <SyndicationSection />
            </Flex>
        </Flex>
    );
};

export default Splash;
