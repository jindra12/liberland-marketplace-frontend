import * as React from "react";

import { AnalyticsProvider } from "use-analytics";

import { appAnalytics } from "./analytics";
import { AnalyticsMutationBridge } from "./AnalyticsMutationBridge";

export const AppAnalyticsProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <AnalyticsProvider instance={appAnalytics}>
            <AnalyticsMutationBridge />
            {props.children}
        </AnalyticsProvider>
    );
};
