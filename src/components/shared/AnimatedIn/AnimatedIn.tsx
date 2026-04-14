import * as React from "react";

import type { AnimatedInProps } from "./types";

export const AnimatedIn: React.FunctionComponent<AnimatedInProps> = (props) => {
    return <div className={`AnimatedIn${props.className ? ` ${props.className}` : ""}`}>{props.children}</div>;
};
