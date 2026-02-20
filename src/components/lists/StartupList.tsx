import * as React from "react";
import { useListStartupsQuery } from "../../generated/graphql";
import { StartupListInternal } from "./StartupListInternal";

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
