import * as React from "react";
import type { FallbackProps } from "react-error-boundary";
import { RuntimeErrorState } from "./RuntimeErrorState";
export const RouteErrorFallback: React.FunctionComponent<FallbackProps> = (props) => {
    return <RuntimeErrorState error={props.error as Error} onRetry={props.resetErrorBoundary} scope="route" />;
};
