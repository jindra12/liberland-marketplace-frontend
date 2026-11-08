import { useAuth } from "react-oidc-context";
import { notification } from "antd";

import { useEndpointContext } from "../EndpointContext";
import type { EndpointAction, EndpointAuthActionController } from "./types";
import { buildAuthAuthority } from "../auth/utils";
import { tryNormalizeEndpointUrl } from "../endpoints/utils";

export const useEndpointAuthAction = (): EndpointAuthActionController => {
    const auth = useAuth();
    const endpointContext = useEndpointContext();
    const { authUrl, setAuthUrl, pendingAction, setPendingAction } = endpointContext;

    const runWithTargetAuthUrl = async (targetAuthUrl: string, action: EndpointAction) => {
        const target = tryNormalizeEndpointUrl(targetAuthUrl);
        if (!target || !endpointContext.urls.some((entry) => entry.value === target)) {
            setPendingAction(undefined);
            notification.warning({ message: "Enable this server in Syndication before signing in to it." });
            return;
        }
        if (target !== authUrl || auth.settings.authority !== buildAuthAuthority(target) || auth.isLoading) {
            setPendingAction({
                action,
                targetAuthUrl: target,
            });
            setAuthUrl(target);
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
