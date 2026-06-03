import * as React from "react";

import { AuthProvider } from "react-oidc-context";
import { useNavigate } from "react-router-dom";

import { buildAuthSettings } from "./auth/utils";
import { useEndpointContext } from "./EndpointContext";

export const AuthContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { authUrl } = useEndpointContext();
    const navigate = useNavigate();
    const authSettings = buildAuthSettings(authUrl);

    return (
        <AuthProvider
            key={authSettings.authority}
            {...authSettings}
            onSigninCallback={() => {
                navigate("/", { replace: true });
            }}
        >
            {props.children}
        </AuthProvider>
    );
};
