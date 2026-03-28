import * as React from "react";
import { useLocation } from "react-router-dom";
import { useAnalytics } from "use-analytics";

export const AnalyticsAppEffects: React.FunctionComponent = () => {
    const analytics = useAnalytics();
    const { hash, pathname, search } = useLocation();
    React.useEffect(() => {
        analytics.page({ route: `${pathname}${search}${hash}` });
    }, [analytics, hash, pathname, search]);
    return null;
};
