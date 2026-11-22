import * as React from "react";

import { Flex, Typography } from "antd";

import { routes } from "../routes";

import { RouteButton } from "./RouteButton";
import { SearchButton } from "./SearchButton";
import { MarketAccordion } from "./splash/MarketAccordion";

const Splash: React.FunctionComponent = () => {
    return (
        <Flex vertical gap={32} className="SplashPage">
            <Flex vertical gap={16} className="SplashPage__hero">
                <Flex vertical gap={8}>
                    <Typography.Title level={1} className="SplashPage__heroTitle">
                        Marketplace
                    </Typography.Title>
                    <Typography.Paragraph className="SplashPage__heroDescription">
                        Browse products, companies, jobs and ventures across tribes.
                    </Typography.Paragraph>
                </Flex>
                <Flex gap={8} wrap className="SplashPage__heroActions">
                    <SearchButton type="primary">Search marketplace</SearchButton>
                    <RouteButton to={routes.productsServices.route}>Products and services</RouteButton>
                    <RouteButton to={routes.companies.route}>Companies</RouteButton>
                    <RouteButton to={routes.jobs.route}>Jobs</RouteButton>
                    <RouteButton to={routes.ventures.route}>Ventures</RouteButton>
                    <RouteButton to={routes.tribes.route}>Tribes</RouteButton>
                </Flex>
            </Flex>
            <Flex vertical className="SplashPage__sections">
                <MarketAccordion />
            </Flex>
        </Flex>
    );
};

export default Splash;
