import * as React from "react";

import useLocalStorage from "use-local-storage";

import type { TourType } from "./types";
import { TOUR_LOCAL_STORAGE_KEY } from "./utils";

type TourServiceStateValue = {
    pendingTourType: TourType | undefined;
    setPendingTourType: React.Dispatch<React.SetStateAction<TourType | undefined>>;
    authPromptDismissed: boolean;
    setAuthPromptDismissed: React.Dispatch<React.SetStateAction<boolean>>;
    activeTourType: TourType | "auth-prompt" | null;
    setActiveTourType: React.Dispatch<React.SetStateAction<TourType | "auth-prompt" | null>>;
    currentStep: number;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
    resetTourState: () => void;
};

const TourServiceStateContext = React.createContext<TourServiceStateValue | null>(null);

export const TourServiceStateProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [pendingTourType, setPendingTourType] = useLocalStorage<TourType | undefined>(
        TOUR_LOCAL_STORAGE_KEY,
        undefined,
    );
    const [authPromptDismissed, setAuthPromptDismissed] = React.useState(false);
    const [activeTourType, setActiveTourType] = React.useState<TourType | "auth-prompt" | null>(null);
    const [currentStep, setCurrentStep] = React.useState(0);

    const resetTourState = () => {
        setActiveTourType(null);
        setCurrentStep(0);
    };

    return (
        <TourServiceStateContext.Provider
            value={{
                pendingTourType,
                setPendingTourType,
                authPromptDismissed,
                setAuthPromptDismissed,
                activeTourType,
                setActiveTourType,
                currentStep,
                setCurrentStep,
                resetTourState,
            }}
        >
            {props.children}
        </TourServiceStateContext.Provider>
    );
};

export const useTourServiceState = () => {
    const value = React.useContext(TourServiceStateContext);
    if (!value) {
        throw new Error("useTourServiceState must be used within TourServiceStateProvider");
    }

    return value;
};
