import * as React from "react";
import { useTrackPageView } from "./useTrackPageView";

export const AnalyticsPageTracker: React.FunctionComponent = () => {
    useTrackPageView();

    return null;
};
