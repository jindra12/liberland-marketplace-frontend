import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Flex, Result, Spin } from "antd";

import { RouteButton } from "./RouteButton";

const AuthCallback: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        navigate("/", { replace: true });
    }, [auth.isAuthenticated, navigate]);

    const title = auth.error
        ? "Could not complete sign-in"
        : auth.isAuthenticated
          ? "Signed in successfully"
          : "Completing sign-in";

    const subTitle = auth.error ? (
        <RouteButton to="/" type="primary" icon={<ArrowLeftOutlined />}>
            Back to homepage
        </RouteButton>
    ) : (
        "Please wait while we finish authentication."
    );

    return (
        <Flex vertical align="center" justify="center" role="status">
            <Result
                icon={auth.error ? undefined : <Spin />}
                status={auth.error ? "error" : "info"}
                title={title}
                subTitle={subTitle}
            />
        </Flex>
    );
};

export default AuthCallback;
