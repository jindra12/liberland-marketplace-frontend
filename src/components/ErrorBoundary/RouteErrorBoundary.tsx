import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router-dom";
import { RouteErrorFallback } from "./RouteErrorFallback";
import { trackRuntimeError } from "./trackRuntimeError";

export const RouteErrorBoundary: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { hash, pathname, search } = useLocation();

    return (
        <ErrorBoundary
            FallbackComponent={RouteErrorFallback}
            onError={(error, info) => {
                trackRuntimeError("route", error as Error, info);
            }}
            resetKeys={[pathname, search, hash]}
        >
            {props.children}
        </ErrorBoundary>
    );
};
