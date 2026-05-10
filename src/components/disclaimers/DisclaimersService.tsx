import * as React from "react";

import { DisclaimersProvider } from "./context";
import { DisclaimersModal } from "./DisclaimersModal";

export const DisclaimersService: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    return (
        <DisclaimersProvider>
            {props.children}
            <DisclaimersModal />
        </DisclaimersProvider>
    );
};
