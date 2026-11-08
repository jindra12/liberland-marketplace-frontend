import * as React from "react";

import { Result } from "antd";

import { useIsOwnedByServerUser } from "./detail/useIsOwnedByServerUser";

interface OwnerGuardProps {
    createdById?: string;
    serverURL: string;
    children: React.ReactNode;
}
export const OwnerGuard: React.FunctionComponent<OwnerGuardProps> = (props) => {
    const isOwner = useIsOwnedByServerUser({ ownerUserId: props.createdById, serverURL: props.serverURL });
    if (!isOwner) {
        return <Result status="403" title="Not authorized" subTitle="You can only edit your own listings." />;
    }
    return <>{props.children}</>;
};
