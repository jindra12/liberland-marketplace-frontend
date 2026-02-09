import * as React from "react";
import { Flex, Typography } from "antd";
import { JobList } from "./lists/JobList";

const Splash: React.FunctionComponent = () => {
    return (
        <Flex vertical gap={32} justify="center" className="SplashPage">
            <picture className="SplashPage__picture">
                <source
                    media="(max-width: 768px)"
                    srcSet="/hero/hero-mobile-900x1200.png 1x, /hero/hero-mobile-1350x1800.png 2x"
                />
                <source
                    media="(min-width: 769px)"
                    srcSet="/hero/hero-desktop-1600x900.png 1x, /hero/hero-desktop-2400x1350.png 2x"
                />
                <img
                    className="SplashPage__img"
                    src="/hero/hero-desktop-1600x900.png"
                    alt="Liberland Market"
                />
            </picture>
            <Flex vertical gap={32} justify="center" className="SplashPage__content">
                <Typography.Title level={1} className="SplashPage__title">
                    Liberland Market
                </Typography.Title>
                <JobList limited />
            </Flex>
        </Flex>
    );
};

export default Splash;
