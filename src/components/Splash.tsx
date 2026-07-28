import * as React from "react";

import { Image, Flex, Typography, Grid } from "antd";

import { routes } from "../routes";

import { RouteButton } from "./RouteButton";
import { AnimatedIn } from "./shared/AnimatedIn/AnimatedIn";
import { MarketAccordion } from "./splash/MarketAccordion";

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
                        height={400}
                        className="SplashPage__heroBackdrop"
                    />
                    <AnimatedIn className="SplashPage__heroOverlay">
                        <Flex vertical align="center" justify="center" gap={18} className="SplashPage__heroOverlayInner">
                            <Typography.Title level={1} className="SplashPage__heroWordmark">
                                NSWAP
                            </Typography.Title>
                            <Typography.Paragraph className="SplashPage__heroDescription">
                                Decentralized marketplace across tribes
                            </Typography.Paragraph>
                            <Flex wrap justify="center" gap={12} className="SplashPage__heroActions">
                                <RouteButton to={routes.productsServices.route} type="primary" size="large" className="SplashPage__heroPrimaryBtn">
                                    Explore market
                                </RouteButton>
                                <RouteButton to={routes.tribes.route} size="large" className="SplashPage__heroSecondaryBtn">
                                    Explore Tribes
                                </RouteButton>
                            </Flex>
                        </Flex>
                    </AnimatedIn>
                </Flex>
            </section>

            <Flex vertical gap={20} className="SplashPage__sections">
                {!md ? (
                    <div className="SplashPage__marketAccordion SplashPage__marketAccordion--mobile">
                        <MarketAccordion />
                    </div>
                ) : (
                    <div className="SplashPage__marketAccordion">
                        <MarketAccordion />
                    </div>
                )}
            </Flex>
        </Flex>
    );
};

export default Splash;
