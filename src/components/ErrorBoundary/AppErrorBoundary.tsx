import * as React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useLocation } from "react-router-dom";
import { AppErrorFallback } from "./AppErrorFallback";
import { trackRuntimeError } from "./trackRuntimeError";

export const AppErrorBoundary: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { hash, pathname, search } = useLocation();

    return (
        <ErrorBoundary
            FallbackComponent={AppErrorFallback}
            onError={(error, info) => {
                trackRuntimeError("app", error as Error, info);
            }}
            resetKeys={[pathname, search, hash]}
        >
            {props.children}
        </ErrorBoundary>
    );
};
