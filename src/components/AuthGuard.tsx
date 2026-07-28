import * as React from "react";

import { useAuth } from "react-oidc-context";
import { Navigate, useLocation } from "react-router-dom";

import { Spin } from "antd";

import { routes } from "../routes";

import { buildLoginReturnTo } from "./auth/utils";

interface AuthGuardProps {
    redirect?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}
export const AuthGuard: React.FunctionComponent<AuthGuardProps> = (props) => {
    const auth = useAuth();
    const location = useLocation();
    const returnTo = buildLoginReturnTo(location.pathname, location.search, location.hash);
    if (auth.isLoading) return <Spin />;
    if (!auth.isAuthenticated) {
        if (props.redirect) {
            auth.signinRedirect({
                state: returnTo,
            });
            return <Spin />;
        }
        return props.fallback || <Navigate to={routes.home.route} replace />;
    }
    return <>{props.children}</>;
};
