import * as React from "react";
import { useListStartupsQuery } from "../../generated/graphql";
import { VentureListInternal } from "./VentureListInternal";

export const VentureList: React.FunctionComponent = () => {
    const [page, setPage] = React.useState(0);
    const query = useListStartupsQuery({
        limit: 10,
        page,
    });

    return (
        <VentureListInternal
            page={page}
            query={query}
            setPage={setPage}
        />
    );
};
