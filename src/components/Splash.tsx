import * as React from "react";

import { Flex, Typography } from "antd";

import { RouteButton } from "./RouteButton";
import { MarketAccordion } from "./splash/MarketAccordion";
import { SyndicationSection } from "./splash/SyndicationSection";

const Splash: React.FunctionComponent = () => {
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
                <div className="SplashPage__marketAccordion">
                    <MarketAccordion />
                </div>

                <SyndicationSection />
            </Flex>
        </Flex>
    );
};

export default Splash;
