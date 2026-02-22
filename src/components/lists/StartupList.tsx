import * as React from "react";

import { StartupListInternal } from "./StartupListInternal";
import { useListStartupsQuery } from "../hooks";

export const StartupList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListStartupsQuery({
        limit: 10,
        page,
    });

    return (
        <StartupListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
