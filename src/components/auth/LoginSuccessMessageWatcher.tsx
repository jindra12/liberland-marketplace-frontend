import * as React from "react";

import { useLocation } from "react-router-dom";

import { useSessionStorage } from "usehooks-ts";

import { routes } from "../../routes";

import { LOGIN_SUCCESS_MESSAGE_STORAGE_KEY } from "./constants";

export interface LoginSuccessMessageWatcherProps {
    messageApi: {
        success: (content: string) => void;
    };
}

export const LoginSuccessMessageWatcher: React.FunctionComponent<LoginSuccessMessageWatcherProps> = (props) => {
    const location = useLocation();
    const [loginSuccessPending, setLoginSuccessPending] = useSessionStorage<boolean>(
        LOGIN_SUCCESS_MESSAGE_STORAGE_KEY,
        false,
    );

    React.useEffect(() => {
        if (!loginSuccessPending) {
            return;
        }

        if (location.pathname === routes.authCallback.route) {
            return;
        }

        props.messageApi.success("You were logged in successfully.");
        setLoginSuccessPending(false);
    }, [loginSuccessPending, location.pathname, props.messageApi, setLoginSuccessPending]);

    return null;
};
