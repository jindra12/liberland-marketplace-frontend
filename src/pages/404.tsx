import * as React from "react";

import { AppHead } from "../AppHead";
import { Dynamic } from "../Dynamic";

const NotFoundPage: React.FunctionComponent = () => {
    return (
        <>
            <AppHead
                title="Page not found | NSwap"
                description="The requested page could not be found."
                canonicalPath="/404"
                noIndex
            />
            <Dynamic />
        </>
    );
};

export default NotFoundPage;
