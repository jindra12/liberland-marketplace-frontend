import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Divider, Flex, Result, Spin } from "antd";

import { routes } from "../routes";

import { getLoginReturnTo } from "./auth/utils";
import { RouteButton } from "./RouteButton";

const AuthCallback: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const errorText = auth.error
        ? JSON.stringify(auth.error, Object.getOwnPropertyNames(auth.error), 2)
        : "";

    React.useEffect(() => {
        if (auth.isLoading || auth.error || !auth.user) {
            return;
        }

        navigate(getLoginReturnTo(auth.user?.state) || routes.home.route, { replace: true });
    }, [auth.error, auth.isLoading, auth.user, navigate]);

    const title = auth.error
        ? "Could not complete sign-in"
        : auth.isAuthenticated
          ? "Signed in successfully"
          : "Completing sign-in";

    return (
        <Flex vertical align="center" className="AuthCallback" role="status">
            <Result
                className="AuthCallback__result"
                icon={auth.error ? undefined : <Spin />}
                status={auth.error ? "error" : "info"}
                title={title}
                subTitle={auth.error ? undefined : "Please wait while we finish authentication."}
            />
            {auth.error && (
                <Flex vertical align="center" gap={16} className="AuthCallback__errorSection">
                    <RouteButton to={routes.home.getLink()} type="primary" icon={<ArrowLeftOutlined />}>
                        Back to homepage
                    </RouteButton>
                    <Divider className="AuthCallback__divider" />
                    <Flex justify="center" className="AuthCallback__errorPanelWrap">
                        <div className="AuthCallback__errorPanel">
                            <pre className="AuthCallback__error">
                                <code>{errorText}</code>
                            </pre>
                        </div>
                    </Flex>
                </Flex>
            )}
        </Flex>
    );
};

export default AuthCallback;
