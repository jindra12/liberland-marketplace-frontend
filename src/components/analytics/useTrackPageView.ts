import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "use-analytics";

export const useTrackPageView = (serverUrl?: string | null) => {
    const analytics = useAnalytics();
    const { pathname } = useLocation();

    React.useEffect(() => {
        analytics?.page?.(
            { route: pathname },
            serverUrl ? { targetUrl: serverUrl } : undefined,
        );
    }, [analytics, pathname, serverUrl]);
};
