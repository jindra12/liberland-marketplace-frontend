import * as React from "react";

import { AuthProvider } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import type { UserManagerSettings } from "oidc-client-ts";

import { routes } from "../../routes";

import { getLoginReturnTo } from "./utils";

export interface AuthContextProviderInnerProps {
    authSettings: UserManagerSettings;
    children: React.ReactNode;
    setLoginSuccessPending: (value: boolean) => void;
}

export const AuthContextProviderInner: React.FunctionComponent<AuthContextProviderInnerProps> = (props) => {
    const navigate = useNavigate();

    return (
        <AuthProvider
            key={props.authSettings.authority}
            {...props.authSettings}
            onSigninCallback={(user) => {
                props.setLoginSuccessPending(true);
                navigate(getLoginReturnTo(user?.state) || routes.home.route, { replace: true });
            }}
        >
            {props.children}
        </AuthProvider>
    );
};
