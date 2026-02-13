import React from "react";
import { generatePKCE, buildAuthorizeURL, type OIDCUser } from "../oidc";

const TOKEN_KEY = "oidc_access_token";
const USER_KEY = "oidc_user";

interface AuthContextValue {
    user: OIDCUser | null;
    token: string | null;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
    setSession: (token: string, user: OIDCUser) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function loadStoredUser(): OIDCUser | null {
    try {
        const raw = localStorage.getItem(USER_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export const AuthProvider: React.FunctionComponent<React.PropsWithChildren> = ({
    children,
}) => {
    const [token, setToken] = React.useState<string | null>(
        () => localStorage.getItem(TOKEN_KEY),
    );
    const [user, setUser] = React.useState<OIDCUser | null>(loadStoredUser);

    const login = React.useCallback(async () => {
        const { codeVerifier, codeChallenge } = await generatePKCE();
        const state = crypto.randomUUID();

        sessionStorage.setItem("oidc_code_verifier", codeVerifier);
        sessionStorage.setItem("oidc_state", state);

        const url = buildAuthorizeURL(state, codeChallenge);
        window.location.href = url;
    }, []);

    const logout = React.useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
    }, []);

    const setSession = React.useCallback((newToken: string, newUser: OIDCUser) => {
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    }, []);

    const value = React.useMemo<AuthContextValue>(
        () => ({
            user,
            token,
            isAuthenticated: !!token,
            login,
            logout,
            setSession,
        }),
        [user, token, login, logout, setSession],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
