import * as React from "react";
import { Alert, Empty, Flex, Spin, Tag, Typography } from "antd";

import { IdentityMarketSection } from "./splash/IdentityMarketSection";
import { useListIdentitiesQuery } from "./hooks";

const Splash: React.FunctionComponent = () => {
    const identitiesQuery = useListIdentitiesQuery({
        page: 1,
        limit: 100,
        sort: "name",
    });
    const identities = identitiesQuery.data?.Identities?.docs || [];
    const isLoading = identitiesQuery.isLoading;
    const hasError = Boolean(identitiesQuery.error);

    return (
        <Flex vertical gap={18} className="SplashPage">
            <section className="SplashPage__hero">
                <div className="SplashPage__heroInner">
                    <div className="SplashPage__heroCopy">
                        <Tag className="SplashPage__eyebrow">Identity-first discovery</Tag>
                        <Typography.Title level={1} className="SplashPage__heroTitle">
                            Jita-44
                        </Typography.Title>
                        <Typography.Paragraph className="SplashPage__heroDescription">
                            Universal syndicated marketplace.
                        </Typography.Paragraph>
                    </div>
                    <div className="SplashPage__heroVisual">
                        <div className="SplashPage__heroLogo">
                            <img className="SplashPage__heroGlyph" src="/logo.svg" alt="Jita-44 logo" />
                        </div>
                    </div>
                </div>
            </section>

            <div className="SplashPage__sections">
                {hasError && (
                    <Alert
                        type="error"
                        showIcon
                        message="Failed to load identities"
                        description="Try refreshing the page."
                    />
                )}

                {!hasError && !identities.length && isLoading && (
                    <Flex justify="center" align="center" className="SplashPage__loading">
                        <Spin />
                    </Flex>
                )}

                {!hasError && !identities.length && !isLoading && (
                    <Empty description="No identities found yet." />
                )}

                {identities.length > 0 && (
                    <Flex vertical gap={18} className="SplashPage__identityList">
                        {identities.map((identity) => (
                            <IdentityMarketSection
                                key={identity.id}
                                identityId={identity.id}
                                identityName={identity.name || "Identity"}
                            />
                        ))}
                    </Flex>
                )}
            </div>
        </Flex>
    );
};

export default Splash;
