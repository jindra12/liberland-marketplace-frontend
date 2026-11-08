// eslint-disable-next-line no-restricted-syntax -- Use React's runtime default import for namespace types.
import React from "react";

import { RouteNavigationGuard } from "./RouteNavigationGuard";
import { useFormExitWarning } from "./useFormExitWarning";

export const FormNavigationGuard: React.FunctionComponent = () => {
    const guard = useFormExitWarning();
    // Standalone forms can also be mounted without a data router; unload protection still applies.
    return guard.dataRouter ? <RouteNavigationGuard form={guard.form} /> : null;
};
