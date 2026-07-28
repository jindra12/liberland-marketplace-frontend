import * as React from "react";

import { TourAuthListener } from "./TourAuthListener";
import { TourHashListener } from "./TourHashListener";
import { TourRenderer } from "./TourRenderer";
import { TourRouteListener } from "./TourRouteListener";
import { TourServiceStateProvider } from "./TourServiceState";

export const TourService: React.FunctionComponent = () => (
    <TourServiceStateProvider>
        <TourHashListener />
        <TourRouteListener />
        <TourAuthListener />
        <TourRenderer />
    </TourServiceStateProvider>
);
