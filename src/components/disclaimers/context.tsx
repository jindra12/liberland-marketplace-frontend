import * as React from "react";

import { defaultDisclaimerKey } from "./constants";
import type { DisclaimersContextValue, DisclaimerKey } from "./types";

const DisclaimersContext = React.createContext<DisclaimersContextValue | null>(null);

export const DisclaimersProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedDisclaimerKey, setSelectedDisclaimerKey] = React.useState<DisclaimerKey>(defaultDisclaimerKey);

    return (
        <DisclaimersContext.Provider
            value={{
                isOpen,
                selectedDisclaimerKey,
                openDisclaimers: (key = defaultDisclaimerKey) => {
                    setSelectedDisclaimerKey(key);
                    setIsOpen(true);
                },
                closeDisclaimers: () => {
                    setIsOpen(false);
                },
                selectDisclaimer: (key) => {
                    setSelectedDisclaimerKey(key);
                },
            }}
        >
            {props.children}
        </DisclaimersContext.Provider>
    );
};

export const useDisclaimers = (): DisclaimersContextValue => {
    const context = React.useContext(DisclaimersContext);
    if (!context) {
        throw new Error("useDisclaimers must be used within DisclaimersProvider");
    }

    return context;
};
