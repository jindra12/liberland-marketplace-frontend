import * as React from "react";

import { useLocation } from "react-router-dom";

import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Collapse, Flex, Typography } from "antd";

import { routes } from "../../routes";
import { RouteButton } from "../RouteButton";
import { StorageResetPrompt } from "../shared/StorageResetPrompt";

import { ErrorBoundaryScope } from "./trackRuntimeError";

type RuntimeErrorStateProps = {
    error: Error;
    onRetry: () => void;
    scope: ErrorBoundaryScope;
};

export const RuntimeErrorState: React.FunctionComponent<RuntimeErrorStateProps> = (props) => {
    const location = useLocation();

    return (
        <Flex align="center" justify="center" className={`RuntimeErrorState RuntimeErrorState--${props.scope}`}>
            <Flex vertical gap={20} className="RuntimeErrorState__panel RuntimeErrorState__content">
                <Flex vertical gap={8}>
                    <Typography.Title level={2} className="RuntimeErrorState__title">
                        We couldn't load this page
                    </Typography.Title>
                    <Typography.Paragraph className="RuntimeErrorState__subtitle">
                        Try again, or return to the marketplace. Your saved cart and settings have not been cleared.
                    </Typography.Paragraph>
                </Flex>
                <Flex gap={12} wrap className="RuntimeErrorState__actions">
                    <Button type="primary" icon={<ReloadOutlined />} onClick={props.onRetry}>
                        Try again
                    </Button>
                    <RouteButton to={routes.home.route} icon={<HomeOutlined />}>
                        Back to marketplace
                    </RouteButton>
                    <Button type="text" onClick={() => window.location.reload()}>
                        Reload page
                    </Button>
                </Flex>
                <Collapse
                    ghost
                    items={[
                        {
                            key: "technical",
                            label: "Technical details",
                            children: (
                                <Flex vertical gap={8}>
                                    <Typography.Text code>
                                        {location.pathname}
                                        {location.search}
                                        {location.hash}
                                    </Typography.Text>
                                    <Typography.Paragraph className="RuntimeErrorState__technicalMessage">
                                        {props.error.message}
                                    </Typography.Paragraph>
                                    <Typography.Paragraph className="RuntimeErrorState__technicalStack">
                                        {props.error.stack}
                                    </Typography.Paragraph>
                                </Flex>
                            ),
                        },
                        {
                            key: "advanced",
                            label: "Advanced recovery",
                            children: <StorageResetPrompt />,
                        },
                    ]}
                />
            </Flex>
        </Flex>
    );
};
