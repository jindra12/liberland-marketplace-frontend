import * as React from "react";

import { useEndpointContext } from "./EndpointContext";
import { usePermissionsQuery } from "./hooks";
import { AppBootSkeleton } from "./LoadingSkeleton/AppBootSkeleton";

type PermissionsContextValue = {
    canCreateContent: (serverUrl: string) => boolean;
};

const PermissionsContext = React.createContext<PermissionsContextValue | null>(null);

export const PermissionsContextProvider: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const { authUrl } = useEndpointContext();
    const permissionsQuery = usePermissionsQuery({ url: authUrl }, { enabled: Boolean(authUrl) });
    const permissions = permissionsQuery.data?.permissions ?? [];

    if (permissionsQuery.isLoading) {
        return <AppBootSkeleton />;
    }

    return (
        <PermissionsContext.Provider
            value={{
                canCreateContent: (serverUrl: string) =>
                    permissions.some(
                        (permission) =>
                            permission.serverUrl === serverUrl && permission.canCreateContentAsNonAdmin,
                    ),
            }}
        >
            {props.children}
        </PermissionsContext.Provider>
    );
};

export const usePermissionsContext = (): PermissionsContextValue => {
    const context = React.useContext(PermissionsContext);
    if (!context) {
        throw new Error("usePermissionsContext must be used within PermissionsContextProvider");
    }
    return context;
};
