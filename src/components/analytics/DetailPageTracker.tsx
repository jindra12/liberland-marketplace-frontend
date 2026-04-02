import * as React from "react";
import { useTrackPageView } from "./useTrackPageView";
type DetailPageTrackerProps = {
    serverUrl?: string;
};
export const DetailPageTracker: React.FunctionComponent<DetailPageTrackerProps> = (props) => {
    useTrackPageView(props.serverUrl);
    return null;
};
