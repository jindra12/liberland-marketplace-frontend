import * as React from "react";
import { Dynamic } from "./Dynamic";
import { AppHead } from "./AppHead";

const ShellPage: React.FunctionComponent = () => {
    return (
        <>
            <AppHead />
            <Dynamic />
        </>
    );
};

export default ShellPage;
