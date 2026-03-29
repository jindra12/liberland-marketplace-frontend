import * as React from "react";
import { AnalyticsProvider } from "use-analytics";
import { AnalyticsMutationBridge } from "./AnalyticsMutationBridge";
import { appAnalytics } from "./analytics";

export const AppAnalyticsProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <AnalyticsProvider instance={appAnalytics}>
            <AnalyticsMutationBridge />
            {props.children}
        </AnalyticsProvider>
    );
};
