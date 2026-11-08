import * as React from "react";

import { useListPage } from "../../../hooks/useListPage";
import { useListStartupsByIdentityQuery } from "../../hooks";
import { StartupListInternal } from "../../lists/StartupListInternal";

import type { IdentityDetailTabProps } from "./types";

export const IdentityVenturesTab: React.FunctionComponent<IdentityDetailTabProps> = (props) => {
    const { page, setPage } = useListPage(props.identityId, props.serverURL);
    const startupsQuery = useListStartupsByIdentityQuery(
        { identityId: props.identityId, page, limit: 20, url: props.serverURL },
        { enabled: Boolean(props.identityId) },
    );

    return <StartupListInternal page={page} query={startupsQuery} setPage={setPage} />;
};
