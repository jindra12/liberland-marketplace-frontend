import * as React from "react";
import type { FallbackProps } from "react-error-boundary";
import { RuntimeErrorState } from "./RuntimeErrorState";

export const RouteErrorFallback: React.FunctionComponent<FallbackProps> = ({
    error,
    resetErrorBoundary,
}) => (
    <RuntimeErrorState error={error as Error} onRetry={resetErrorBoundary} scope="route" />
);
