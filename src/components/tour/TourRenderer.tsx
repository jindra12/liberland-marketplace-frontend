import * as React from "react";

import { Grid, Tour } from "antd";

import { TOUR_AUTH_PROMPT_STEPS, TOUR_DEFINITIONS } from "./constants";
import { useTourServiceState } from "./TourServiceState";
import type { TourRenderMode } from "./types";
import { buildTourSteps, selectTourSteps } from "./utils";

const getTourMode = (md: boolean | undefined): TourRenderMode => (md ? "desktop" : "mobile");

const getTourDefinition = (type: keyof typeof TOUR_DEFINITIONS) => TOUR_DEFINITIONS[type];

export const TourRenderer: React.FunctionComponent = () => {
    const { md } = Grid.useBreakpoint();
    const { activeTourType, authPromptDismissed, currentStep, resetTourState, setAuthPromptDismissed, setCurrentStep } =
        useTourServiceState();
    const mode = getTourMode(md);
    const activeDefinition = activeTourType && activeTourType !== "auth-prompt" ? getTourDefinition(activeTourType) : null;
    const activeSteps = activeDefinition ? selectTourSteps(activeDefinition, mode, "main") : [];
    const authPromptSteps = buildTourSteps(mode === "mobile" ? TOUR_AUTH_PROMPT_STEPS.mobile : TOUR_AUTH_PROMPT_STEPS.desktop);
    const open = Boolean(activeTourType) && !(activeTourType === "auth-prompt" && authPromptDismissed);

    if (!open) {
        return null;
    }

    return (
        <Tour
            open={open}
            current={currentStep}
            onChange={setCurrentStep}
            onClose={() => {
                if (activeTourType === "auth-prompt") {
                    setAuthPromptDismissed(true);
                    return;
                }

                resetTourState();
            }}
            steps={activeTourType === "auth-prompt" ? authPromptSteps : activeSteps}
        />
    );
};
