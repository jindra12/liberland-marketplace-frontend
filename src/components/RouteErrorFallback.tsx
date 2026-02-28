import * as React from "react";
import { Button, Result } from "antd";

type RouteErrorFallbackProps = {
    error?: Error;
};

export const RouteErrorFallback: React.FunctionComponent<RouteErrorFallbackProps> = ({ error }) => (
    <Result
        status="500"
        title="Something went wrong on this page"
        subTitle={
            error?.message
                ? `Rendering failed: ${error.message}. Try refreshing this page.`
                : "An unexpected runtime error occurred while rendering this route. Try refreshing this page."
        }
        extra={(
            <Button type="primary" onClick={() => window.location.reload()}>
                Refresh page
            </Button>
        )}
    />
);
