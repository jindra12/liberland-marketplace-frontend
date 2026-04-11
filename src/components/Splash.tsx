import * as React from "react";

import { Alert, Empty, Flex, Typography } from "antd";

import { useListIdentitiesQuery } from "./hooks";
import { SplashSectionsSkeleton } from "./LoadingSkeleton/SplashSectionsSkeleton";
import { RouteButton } from "./RouteButton";
import { IdentityMarketSection } from "./splash/IdentityMarketSection";
import { SyndicationSection } from "./splash/SyndicationSection";

const Splash: React.FunctionComponent = () => {
    const identitiesQuery = useListIdentitiesQuery({
        page: 1,
        limit: 100,
    });
    const identities = identitiesQuery.data?.Identities?.docs;
    const isLoading = identitiesQuery.isLoading;
    const hasError = Boolean(identitiesQuery.error);

    const sortedIdentities = React.useMemo(
        () => [...(identities || [])].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0)),
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
                        Tribe-first marketplace across decentralized servers. Browse companies, products, services,
                        jobs, and ventures
                    </Typography.Paragraph>
                    <Flex wrap justify="center" gap={12} className="SplashPage__heroActions">
                        <RouteButton to="/products-services" type="primary" size="large">
                            Explore market
                        </RouteButton>
                        <RouteButton to="/tribes" size="large">
                            Browse tribes
                        </RouteButton>
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

                {!hasError && !identities?.length && !isLoading && <Empty description="No tribes found yet." />}

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
