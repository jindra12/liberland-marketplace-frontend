import * as React from "react";

import { useListStartupsByIdentityQuery } from "../../hooks";
import { StartupListInternal } from "../../lists/StartupListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityVenturesTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const [page, setPage] = React.useState(1);
    const startupsQuery = useListStartupsByIdentityQuery(
        { identityId: props.identityId, page, limit: 7, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <StartupListInternal page={page} query={startupsQuery} setPage={setPage} />;
};
