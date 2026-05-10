import * as React from "react";

import { Result, Space } from "antd";

import { routes } from "../routes";

import { RouteButton } from "./RouteButton";
import { StorageResetPrompt } from "./shared/StorageResetPrompt";

const NotFound: React.FunctionComponent = () => (
    <Result
        status="404"
        title="Page not found"
        subTitle="The page you requested does not exist."
        extra={
            <Space direction="vertical" size={16}>
                <RouteButton to={routes.home.route} type="primary">
                    Back to homepage
                </RouteButton>
                <StorageResetPrompt />
            </Space>
        }
    />
);

export default NotFound;
