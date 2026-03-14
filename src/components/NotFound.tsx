import * as React from "react";
import { Button, Result } from "antd";

const NotFound: React.FunctionComponent = () => (
    <Result
        status="404"
        title="Page not found"
        subTitle="The page you requested does not exist."
        extra={(
            <Button type="primary" href="/">
                Back to homepage
            </Button>
        )}
    />
);

export default NotFound;
