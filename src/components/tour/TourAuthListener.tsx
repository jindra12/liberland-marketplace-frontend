import * as React from "react";

import { useAuth } from "react-oidc-context";

import { useTourServiceState } from "./TourServiceState";

export const TourAuthListener: React.FunctionComponent = () => {
    const auth = useAuth();
    const { activeTourType, pendingTourType, setAuthPromptDismissed } = useTourServiceState();

    React.useEffect(() => {
        if (auth.isAuthenticated && pendingTourType && activeTourType === "auth-prompt") {
            setAuthPromptDismissed(false);
        }
    }, [activeTourType, auth.isAuthenticated, pendingTourType, setAuthPromptDismissed]);

    return null;
};
