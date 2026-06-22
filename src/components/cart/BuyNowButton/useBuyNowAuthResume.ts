import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router-dom";

import { useSessionStorage } from "usehooks-ts";

import { buildLoginReturnTo } from "../../auth/utils";

import { BUY_NOW_RETURN_TO_STORAGE_KEY } from "./constants";

type UseBuyNowAuthResumeProps = {
    onResume: () => void;
};

export const useBuyNowAuthResume = (props: UseBuyNowAuthResumeProps) => {
    const auth = useAuth();
    const location = useLocation();
    const onResume = props.onResume;
    const returnTo = buildLoginReturnTo(location.pathname, location.search, location.hash);
    const [pendingReturnTo, setPendingReturnTo] = useSessionStorage<string>(BUY_NOW_RETURN_TO_STORAGE_KEY, "");

    React.useEffect(() => {
        if (!auth.isAuthenticated) {
            return;
        }

        if (!pendingReturnTo || pendingReturnTo !== returnTo) {
            return;
        }

        setPendingReturnTo("");
        onResume();
    }, [auth.isAuthenticated, onResume, pendingReturnTo, returnTo, setPendingReturnTo]);

    return {
        returnTo,
        markPendingReturnTo: () => {
            setPendingReturnTo(returnTo);
        },
    };
};
