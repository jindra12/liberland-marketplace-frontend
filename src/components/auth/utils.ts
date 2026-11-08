import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";
import type { SignoutRedirectArgs } from "oidc-client-ts";
import { OAUTH_SCOPES } from "./constants";

export const buildAuthStorageKey = (authority: string, clientId: string) => `oidc.user:${authority}:${clientId}`;

export const isAuthStorageEvent = (event: StorageEvent, authority: string, clientId: string) =>
    event.storageArea === window.localStorage &&
    (event.key === null || event.key === buildAuthStorageKey(authority, clientId));

export const readStoredOidcUser = (authority: string, clientId: string): User | undefined => {
    const stored = window.localStorage.getItem(buildAuthStorageKey(authority, clientId));
    if (!stored) {
        return undefined;
    }
    try {
        return User.fromStorageString(stored);
    } catch (error) {
        console.error(error);
        return undefined;
    }
};

export const readStoredAuthUser = (url: string): User | undefined =>
    readStoredOidcUser(buildAuthAuthority(url), process.env.REACT_APP_OIDC_CLIENT_ID || "");

export const buildAuthAuthority = (authUrl: string) => {
    return `${authUrl}/api/auth`;
};

export const buildSignOutParameters = (returnTo: string): SignoutRedirectArgs => ({
    extraQueryParams: { callbackURL: new URL(returnTo, window.location.origin).toString() },
});

export const buildAuthSettings = (authUrl: string) => {
    const authority = buildAuthAuthority(authUrl);

    return {
        authority,
        client_id: process.env.REACT_APP_OIDC_CLIENT_ID || "",
        redirect_uri: process.env.REACT_APP_OIDC_REDIRECT_URI || `${window.location.origin}/auth/callback`,
        scope: OAUTH_SCOPES.join(" "),
        userStore: new WebStorageStateStore({ store: window.localStorage }),
        metadata: {
            issuer: authority,
            authorization_endpoint: `${authority}/oauth2/authorize`,
            token_endpoint: `${authority}/oauth2/token`,
            userinfo_endpoint: `${authority}/oauth2/userinfo`,
            end_session_endpoint: `${authority}/sign-out`,
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
