import * as React from "react";

import { StartupListInternal } from "./StartupListInternal";
import { useListStartupsQuery } from "../hooks";

export const StartupList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(1);
    const query = useListStartupsQuery({
        limit: 20,
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
