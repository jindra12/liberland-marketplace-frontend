import * as React from "react";

import type { AnimatedInProps } from "./types";

export const AnimatedIn: React.FunctionComponent<AnimatedInProps> = (props) => {
    const isCypress = document.documentElement.getAttribute("data-cypress") === "true";
    return (
        <div className={`${isCypress ? "" : "AnimatedIn"}${props.className ? ` ${props.className}` : ""}`}>
            {props.children}
        </div>
    );
};
