import * as React from "react";
import { Flex, Typography } from "antd";
import { JobList } from "./lists/JobList";

const Splash: React.FunctionComponent = () => {
    return (
        <Flex vertical gap={32} justify="center" className="SplashPage">
            <div className="SplashPage__hero">
                <Flex vertical align="center" gap={12} className="SplashPage__heroInner">
                    <img className="SplashPage__logo" src="/logo.svg" alt="Jita-44" />
                    <Typography.Title level={1} className="SplashPage__title">
                        Jita-44
                    </Typography.Title>
                    <Typography.Text className="SplashPage__tagline">
                        The free marketplace connecting sovereign communities
                    </Typography.Text>
                </Flex>
            </div>
            <Flex vertical gap={32} justify="center" className="SplashPage__content">
                <JobList limited />
            </Flex>
        </Flex>
    );
};

export default Splash;
