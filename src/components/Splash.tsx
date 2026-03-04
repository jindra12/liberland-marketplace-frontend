import * as React from "react";
import { Alert, Empty, Flex, Spin, Tag, Typography } from "antd";
import { useListIdentitiesQuery } from "../generated/graphql";
import { IdentityMarketSection } from "./splash/IdentityMarketSection";

const Splash: React.FunctionComponent = () => {
    const identitiesQuery = useListIdentitiesQuery({
        page: 1,
        limit: 100,
        sort: "name",
    });
    const identities = identitiesQuery.data?.Identities?.docs || [];
    const isLoading = identitiesQuery.isLoading;
    const hasError = Boolean(identitiesQuery.error);

    const sortedIdentities = React.useMemo(
        () => [...identities].sort((a, b) => (b.itemCount ?? 0) - (a.itemCount ?? 0)),
        [identities],
    );

    return (
        <Flex vertical gap={18} className="SplashPage">
            <section className="SplashPage__hero">
                <div className="SplashPage__heroInner">
                    <div className="SplashPage__heroCopy">
                        <Tag className="SplashPage__eyebrow">Tribe-first discovery</Tag>
                        <Typography.Title level={1} className="SplashPage__heroTitle">
                            NSwap
                        </Typography.Title>
                        <Typography.Paragraph className="SplashPage__heroDescription">
                            Network swap market. Those who organize into tribes outcompete those who do not. Empower your tribe. Carve a piece of the world in your image.
                        </Typography.Paragraph>
                    </div>
                    <div className="SplashPage__heroVisual">
                        <div className="SplashPage__heroLogo">
                            <img className="SplashPage__heroGlyph" src="/logo.svg" alt="NSwap logo" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="SplashPage__sections">
                {hasError && (
                    <Alert
                        type="error"
                        showIcon
                        message="Failed to load tribes"
                        description="Try refreshing the page."
                    />
                )}

                {!hasError && !identities.length && isLoading && (
                    <Flex justify="center" align="center" className="SplashPage__loading">
                        <Spin />
                    </Flex>
                )}

                {!hasError && !identities.length && !isLoading && (
                    <Empty description="No tribes found yet." />
                )}

                {sortedIdentities.length > 0 && (
                    <Flex vertical gap={18} className="SplashPage__identityList">
                        {sortedIdentities.map((identity) => (
                            <IdentityMarketSection
                                key={identity.id}
                                identityId={identity.id}
                                identityName={identity.name || "Tribe"}
                                identityImageUrl={identity.image?.url || undefined}
                            />
                        ))}
                    </Flex>
                )}
            </div>
        </Flex>
    );
};

export default Splash;
