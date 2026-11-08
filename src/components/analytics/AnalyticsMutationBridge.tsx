import * as React from "react";

import { useAnalyticsMutationBridge } from "./useAnalyticsMutationBridge";

export const AnalyticsMutationBridge: React.FunctionComponent = () => {
    useAnalyticsMutationBridge();
    return null;
};
