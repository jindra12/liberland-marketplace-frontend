import * as React from "react";

import { useAuth } from "react-oidc-context";
import type { AuthContextProps } from "react-oidc-context";

import { AuthStorageObserver } from "./AuthStorageObserver";

interface AuthContextRelayProps {
    onReady: React.Dispatch<React.SetStateAction<AuthContextProps | undefined>>;
}

export const AuthContextRelay: React.FunctionComponent<AuthContextRelayProps> = (props) => {
    const auth = useAuth();
    React.useLayoutEffect(() => {
        if (!auth.isLoading) {
            props.onReady(auth);
        }
    }, [auth, props]);
    return <AuthStorageObserver auth={auth} />;
};
