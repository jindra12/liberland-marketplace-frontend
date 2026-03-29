import * as React from "react";
import { HomeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Flex, Space, Tag, Typography } from "antd";
import { useLocation } from "react-router-dom";
import { ErrorBoundaryScope } from "./trackRuntimeError";

type RuntimeErrorStateProps = {
    error: Error;
    onRetry: () => void;
    scope: ErrorBoundaryScope;
};

export const RuntimeErrorState: React.FunctionComponent<RuntimeErrorStateProps> = ({
    error,
    onRetry,
    scope,
}) => {
    const { hash, pathname, search } = useLocation();
    const route = `${pathname}${search}${hash}`;
    const isAppBoundary = scope === "app";

    return (
        <Flex
            align="center"
            justify="center"
            className={`RuntimeErrorState RuntimeErrorState--${scope}`}
        >
            <div className="RuntimeErrorState__panel">
                <Space direction="vertical" size={20} className="RuntimeErrorState__content">
                    <Tag color={isAppBoundary ? "magenta" : "gold"} className="RuntimeErrorState__tag">
                        {isAppBoundary ? "App Boundary" : "Route Boundary"}
                    </Tag>
                    <div>
                        <Typography.Title level={2} className="RuntimeErrorState__title">
                            {isAppBoundary ? "The app hit a runtime error" : "This route crashed"}
                        </Typography.Title>
                        <Typography.Paragraph className="RuntimeErrorState__subtitle">
                            {isAppBoundary
                                ? "Something failed while rendering the application shell. You can retry, reload, or head back home."
                                : "Something failed while rendering this screen. You can retry the route or reload the page."}
                        </Typography.Paragraph>
                    </div>
                    <div className="RuntimeErrorState__routeRow">
                        <Typography.Text className="RuntimeErrorState__routeLabel">
                            Route
                        </Typography.Text>
                        <Typography.Text code className="RuntimeErrorState__routeValue">
                            {route}
                        </Typography.Text>
                    </div>
                    <Alert
                        showIcon
                        type="error"
                        message={error.message}
                        className="RuntimeErrorState__alert"
                    />
                    {error.stack && (
                        <details className="RuntimeErrorState__details">
                            <summary>Technical details</summary>
                            <pre>{error.stack}</pre>
                        </details>
                    )}
                    <Flex gap={12} wrap className="RuntimeErrorState__actions">
                        <Button type="primary" icon={<ReloadOutlined />} onClick={onRetry}>
                            {isAppBoundary ? "Try Again" : "Retry Route"}
                        </Button>
                        <Button onClick={() => window.location.reload()}>
                            Reload Page
                        </Button>
                        {isAppBoundary && (
                            <Button href="/" icon={<HomeOutlined />}>
                                Go Home
                            </Button>
                        )}
                    </Flex>
                </Space>
            </div>
        </Flex>
    );
};
