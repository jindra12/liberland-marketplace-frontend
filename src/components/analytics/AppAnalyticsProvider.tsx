import * as React from "react";
import { AnalyticsProvider } from "use-analytics";
import { AnalyticsAppEffects } from "./AnalyticsAppEffects";
import { AnalyticsMutationBridge } from "./AnalyticsMutationBridge";
import { appAnalytics } from "./analytics";

const TypedAnalyticsProvider = AnalyticsProvider as React.ComponentType<
    React.PropsWithChildren<{ instance: typeof appAnalytics }>
>;

export const AppAnalyticsProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <TypedAnalyticsProvider instance={appAnalytics}>
            <AnalyticsMutationBridge />
            <AnalyticsAppEffects />
            {props.children}
        </TypedAnalyticsProvider>
    );
};
