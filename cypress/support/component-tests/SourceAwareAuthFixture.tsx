import React from "react";
import { AuthContext, useAuth } from "react-oidc-context";
import { useEndpointContext } from "../../../src/components/EndpointContext";
import { buildAuthAuthority } from "../../../src/components/auth/utils";

export const SourceAwareAuthFixture: React.FunctionComponent<React.PropsWithChildren> = (props) => {
    const auth = useAuth();
    const endpoint = useEndpointContext();
    return (
        <AuthContext.Provider
            value={{
                ...auth,
                settings: {
                    ...auth.settings,
                    authority: buildAuthAuthority(endpoint.authUrl),
                },
            }}
        >
            {props.children}
        </AuthContext.Provider>
    );
};
