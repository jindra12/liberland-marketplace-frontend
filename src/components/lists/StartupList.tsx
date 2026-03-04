import * as React from "react";
import { useListStartupsQuery } from "../../generated/graphql";
import { StartupListInternal } from "./StartupListInternal";

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
