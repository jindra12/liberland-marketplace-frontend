import * as React from "react";
import { Flex, Spin, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "react-oidc-context";

const AuthCallback: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const fallbackTimer = window.setTimeout(() => {
            navigate("/", { replace: true });
        }, 8000);

        if (!auth.isLoading) {
            const timer = window.setTimeout(() => {
                navigate("/", { replace: true });
            }, 400);

            return () => {
                window.clearTimeout(timer);
                window.clearTimeout(fallbackTimer);
            };
        }

        return () => window.clearTimeout(fallbackTimer);
    }, [auth.isLoading, navigate]);

    const title = auth.error
        ? "Could not complete sign-in"
        : auth.isAuthenticated
            ? "Signed in successfully"
            : "Completing sign-in";

    const subtitle = auth.error
        ? "Redirecting you back to the homepage."
        : "Please wait while we finish authentication.";

    return (
        <Flex
            vertical
            align="center"
            justify="center"
            className="AuthCallback"
            role="status"
            aria-live="polite"
        >
            <div className="AuthCallback__spinnerCluster" aria-hidden>
                <span className="AuthCallback__ring AuthCallback__ring--outer" />
                <span className="AuthCallback__ring AuthCallback__ring--inner" />
                <Spin
                    size="large"
                    indicator={<LoadingOutlined spin style={{ fontSize: 28 }} />}
                />
            </div>
            <Typography.Title level={3} className="AuthCallback__title">
                {title}
            </Typography.Title>
            <Typography.Text type="secondary" className="AuthCallback__subtitle">
                {subtitle}
            </Typography.Text>
        </Flex>
    );
};

export default AuthCallback;
