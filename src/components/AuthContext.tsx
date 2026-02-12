import React from "react";

interface AuthUser {
    id: string;
    email: string;
    name?: string | null;
}

interface AuthState {
    user: AuthUser | null;
    token: string | null;
}

interface AuthContextValue extends AuthState {
    login: (token: string, user: AuthUser, exp?: number | null) => void;
    logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY_TOKEN = "authToken";
const STORAGE_KEY_USER = "authUser";

const loadState = (): AuthState => {
    try {
        const token = localStorage.getItem(STORAGE_KEY_TOKEN);
        const userJson = localStorage.getItem(STORAGE_KEY_USER);
        if (token && userJson) {
            return { token, user: JSON.parse(userJson) };
        }
    } catch { /* ignore */ }
    return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, setState] = React.useState<AuthState>(loadState);

    const login = React.useCallback((token: string, user: AuthUser, _exp?: number | null) => {
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        setState({ token, user });
    }, []);

    const logout = React.useCallback(() => {
        localStorage.removeItem(STORAGE_KEY_TOKEN);
        localStorage.removeItem(STORAGE_KEY_USER);
        setState({ token: null, user: null });
    }, []);

    const value = React.useMemo(
        () => ({ ...state, login, logout }),
        [state, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
    const ctx = React.useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};
