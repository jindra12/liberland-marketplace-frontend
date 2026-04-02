import * as React from "react";

import { AuthProvider } from "react-oidc-context";

import { WebStorageStateStore } from "oidc-client-ts";

import { useEndpointContext } from "./EndpointContext";

export const AuthContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { authUrl: auth } = useEndpointContext();

    const store = React.useMemo(() => new WebStorageStateStore({ store: window.localStorage }), []);

    return (
        <AuthProvider
            authority={`${auth}/api/auth`}
            client_id={process.env.REACT_APP_OIDC_CLIENT_ID || ""}
            client_secret={process.env.REACT_APP_OIDC_CLIENT_SECRET || ""}
            redirect_uri={process.env.REACT_APP_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`}
            scope="openid profile email"
            userStore={store}
            metadata={{
                issuer: `${auth}/api/auth`,
                authorization_endpoint: `${auth}/api/auth/oauth2/authorize`,
                token_endpoint: `${auth}/api/auth/oauth2/token`,
                userinfo_endpoint: `${auth}/api/auth/oauth2/userinfo`,
            }}
            onSigninCallback={() => {
                window.history.replaceState({}, document.title, "/");
            }}
        >
            {props.children}
        </AuthProvider>
    );
};
