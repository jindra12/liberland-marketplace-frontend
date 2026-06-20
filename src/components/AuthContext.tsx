import * as React from "react";

import { useSessionStorage } from "usehooks-ts";

import { AuthContextProviderInner } from "./auth/AuthContextProviderInner";
import { LOGIN_SUCCESS_MESSAGE_STORAGE_KEY } from "./auth/constants";
import { buildAuthSettings } from "./auth/utils";
import { useEndpointContext } from "./EndpointContext";

export const AuthContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { authUrl } = useEndpointContext();
    const [, setLoginSuccessPending] = useSessionStorage<boolean>(LOGIN_SUCCESS_MESSAGE_STORAGE_KEY, false);
    const authSettings = buildAuthSettings(authUrl);

    return (
        <AuthContextProviderInner authSettings={authSettings} setLoginSuccessPending={setLoginSuccessPending}>
            {props.children}
        </AuthContextProviderInner>
    );
};
