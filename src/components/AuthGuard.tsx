import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

import { Spin } from "antd";

interface AuthGuardProps {
    redirect?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}
export const AuthGuard: React.FunctionComponent<AuthGuardProps> = (props) => {
    const auth = useAuth();
    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) {
        if (props.redirect) {
            auth.signinRedirect();
            return <Spin />;
        }
        return props.fallback || <Navigate to="/" replace />;
    }
    return <>{props.children}</>;
};
