import { useAuth } from "react-oidc-context";

import { useEndpointContext } from "../EndpointContext";
import type { EndpointAction, EndpointAuthActionController } from "./types";

export const useEndpointAuthAction = (): EndpointAuthActionController => {
    const auth = useAuth();
    const endpointContext = useEndpointContext();
    const { authUrl, setAuthUrl, pendingAction, setPendingAction } = endpointContext;

    const runWithTargetAuthUrl = async (targetAuthUrl: string, action: EndpointAction) => {
        if (targetAuthUrl !== authUrl) {
            setPendingAction({
                action,
                targetAuthUrl,
            });
            setAuthUrl(targetAuthUrl);
            return;
        }

        setPendingAction(undefined);
        await action(auth);
    };

    return {
        auth,
        urls: endpointContext.urls,
        authUrl,
        pendingAction,
        setAuthUrl,
        setPendingAction,
        runWithTargetAuthUrl,
    };
};
