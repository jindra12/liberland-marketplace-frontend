import * as React from "react";
import { Result } from "antd";
import { RouteButton } from "./RouteButton";

const NotFound: React.FunctionComponent = () => (
    <Result
        status="404"
        title="Page not found"
        subTitle="The page you requested does not exist."
        extra={<RouteButton to="/" type="primary">Back to homepage</RouteButton>}
    />
);

export default NotFound;
