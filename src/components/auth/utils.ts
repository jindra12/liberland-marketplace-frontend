import { UserManager, WebStorageStateStore } from "oidc-client-ts";

export const buildAuthAuthority = (authUrl: string) => {
    return `${authUrl}/api/auth`;
};

export const buildAuthSettings = (authUrl: string) => {
    const authority = buildAuthAuthority(authUrl);

    return {
        authority,
        client_id: process.env.REACT_APP_OIDC_CLIENT_ID || "",
        client_secret: process.env.REACT_APP_OIDC_CLIENT_SECRET || "",
        redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
        scope: "openid profile email",
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        metadata: {
            issuer: authority,
            authorization_endpoint: `${authority}/oauth2/authorize`,
            token_endpoint: `${authority}/oauth2/token`,
            userinfo_endpoint: `${authority}/oauth2/userinfo`,
        },
    };
};

export const createAuthManager = (authUrl: string) => {
    return new UserManager(buildAuthSettings(authUrl));
};

export const buildLoginReturnTo = (pathname: string, search: string, hash: string) => {
    return `${pathname}${search}${hash}`;
};

export const getLoginReturnTo = (state: unknown) => {
    if (typeof state !== "string") {
        return "";
    }

    if (!state.startsWith("/") || state.startsWith("//")) {
        return "";
    }

    return state;
};
