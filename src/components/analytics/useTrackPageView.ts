import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "use-analytics";

export const useTrackPageView = (serverUrl?: string | null) => {
    const analytics = useAnalytics();
    const { hash, pathname, search } = useLocation();

    React.useEffect(() => {
        analytics?.page?.(
            { route: `${pathname}${search}${hash}` },
            serverUrl ? { targetUrl: serverUrl } : undefined,
        );
    }, [analytics, hash, pathname, search, serverUrl]);
};
