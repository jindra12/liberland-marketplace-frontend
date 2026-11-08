import * as React from "react";

import { AuthContext, AuthProvider } from "react-oidc-context";
import type { AuthContextProps } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { Skeleton } from "antd";
import type { UserManagerSettings } from "oidc-client-ts";

import { routes } from "../../routes";

import { AuthContextRelay } from "./AuthContextRelay";
import { getLoginReturnTo } from "./utils";

export interface AuthContextProviderInnerProps {
    authSettings: UserManagerSettings;
    children: React.ReactNode;
    setLoginSuccessPending: (value: boolean) => void;
}

export const AuthContextProviderInner: React.FunctionComponent<AuthContextProviderInnerProps> = (props) => {
    const navigate = useNavigate();
    const [auth, setAuth] = React.useState<AuthContextProps>();

    return (
        <>
            <AuthProvider
                key={props.authSettings.authority}
                {...props.authSettings}
                onSigninCallback={(user) => {
                    props.setLoginSuccessPending(true);
                    navigate(getLoginReturnTo(user?.state) || routes.home.route, { replace: true });
                }}
            >
                <AuthContextRelay onReady={setAuth} />
            </AuthProvider>
            {/* The OIDC provider must remount for a new authority, but the application must not. */}
            {auth ? <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider> : <Skeleton active />}
        </>
    );
};
