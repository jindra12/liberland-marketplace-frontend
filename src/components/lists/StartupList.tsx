import * as React from "react";

import { useListPage } from "../../hooks/useListPage";
import { useListStartupsQuery } from "../hooks";

import { StartupListInternal } from "./StartupListInternal";

export const StartupList: React.FunctionComponent = () => {
    const { page, setPage } = useListPage();
    const query = useListStartupsQuery({
        limit: 20,
        page,
    });

    return <StartupListInternal page={page} query={query} setPage={setPage} />;
};
