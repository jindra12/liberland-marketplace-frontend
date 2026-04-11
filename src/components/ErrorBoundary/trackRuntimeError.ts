import type { ErrorInfo } from "react";
import { appAnalytics } from "../analytics/analytics";

export type ErrorBoundaryScope = "app" | "route";

const getCurrentRoute = () => `${window.location.pathname}${window.location.search}${window.location.hash}`;

export const trackRuntimeError = (scope: ErrorBoundaryScope, error: Error, info: ErrorInfo) => {
    (async () => {
        try {
            await appAnalytics.track("runtime.error", {
                boundary: scope,
                componentStack: info.componentStack,
                message: error.message,
                name: error.name,
                route: getCurrentRoute(),
                stack: error.stack,
            });
        } catch (trackingError) {
            console.error(`Failed to track ${scope} runtime error.`, trackingError);
        }
    })();
};
