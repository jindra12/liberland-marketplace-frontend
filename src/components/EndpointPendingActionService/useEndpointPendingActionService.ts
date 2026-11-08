import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useEndpointContext } from "../EndpointContext";
import { buildAuthAuthority } from "../auth/utils";

export const useEndpointPendingActionService = () => {
    const auth = useAuth();
    const { authUrl, pendingAction, setPendingAction } = useEndpointContext();

    React.useEffect(() => {
        if (
            !pendingAction?.targetAuthUrl ||
            authUrl !== pendingAction.targetAuthUrl ||
            auth.isLoading ||
            auth.settings.authority !== buildAuthAuthority(pendingAction.targetAuthUrl)
        ) {
            return;
        }

        const runPendingAction = async () => {
            const nextAction = pendingAction;

            setPendingAction(undefined);
            await nextAction.action(auth);
        };

        runPendingAction();
    }, [auth, authUrl, pendingAction, setPendingAction]);
};
