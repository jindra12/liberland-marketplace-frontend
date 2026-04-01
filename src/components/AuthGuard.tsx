import React from "react";
import { Navigate } from "react-router-dom";
import { Spin } from "antd";
import { useAuth } from "react-oidc-context";

interface AuthGuardProps {
    redirect?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
}

export const AuthGuard: React.FunctionComponent<AuthGuardProps> = ({ redirect, children, fallback }) => {
    const auth = useAuth();

    if (auth.isLoading) return <Spin />;

    if (!auth.isAuthenticated) {
        if (redirect) {
            auth.signinRedirect();
            return <Spin />;
        }
        return fallback || <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
