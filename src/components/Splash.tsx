import * as React from "react";

import { Image, Flex, Typography, Grid } from "antd";

import { RouteButton } from "./RouteButton";
import { MarketAccordion } from "./splash/MarketAccordion";
import { SyndicationSection } from "./splash/SyndicationSection";

const Splash: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();

    return (
        <Flex vertical gap={24} className="SplashPage">
            <section className="SplashPage__hero">
                <Flex vertical align="center" justify="center" className="SplashPage__heroInner">
                    <Image
                        preview={false}
                        src="/hero/nswap-hero-bg.svg"
                        alt=""
                        aria-hidden="true"
                        width={940}
                        height={540}
                        className="SplashPage__heroBackdrop"
                    />
                    <Flex vertical align="center" justify="center" gap={18} className="SplashPage__heroOverlay">
                        <Typography.Title level={1} className="SplashPage__heroWordmark">
                            NSWAP
                        </Typography.Title>
                        <Flex wrap justify="center" gap={12} className="SplashPage__heroActions">
                            <RouteButton to="/products-services" type="primary" size="large" className="SplashPage__heroPrimaryBtn">
                                Explore market
                            </RouteButton>
                            <RouteButton to="/tribes" size="large" className="SplashPage__heroSecondaryBtn">
                                Explore Tribes
                            </RouteButton>
                        </Flex>
                    </Flex>
                </Flex>
            </section>

            <Flex vertical gap={20} className="SplashPage__sections">
                {!md ? (
                    <div className="SplashPage__marketAccordion SplashPage__marketAccordion--mobile">
                        <MarketAccordion />
                    </div>
                ) : (
                    <>
                        <div className="SplashPage__marketAccordion">
                            <MarketAccordion />
                        </div>
                        <SyndicationSection />
                    </>
                )}
            </Flex>
        </Flex>
    );
};

export default Splash;
