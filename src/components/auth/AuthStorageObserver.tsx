// eslint-disable-next-line no-restricted-syntax -- React namespace types use the standard default import.
import React from "react";

import type { AuthContextProps } from "react-oidc-context";

import { useQueryClient, type Query } from "@tanstack/react-query";

import { useEventListener } from "usehooks-ts";

import { buildAuthAuthority, isAuthStorageEvent, readStoredOidcUser } from "./utils";

interface AuthStorageObserverProps {
    auth: AuthContextProps;
}

export const AuthStorageObserver: React.FunctionComponent<AuthStorageObserverProps> = (props) => {
    const client = useQueryClient();
    useEventListener("storage", async (event) => {
        const authority = props.auth.settings.authority;
        const clientId = props.auth.settings.client_id;
        if (!isAuthStorageEvent(event, authority, clientId)) {
            return;
        }
        const queries = {
            predicate: (query: Query) =>
                query.queryKey.some((value) => typeof value === "string" && buildAuthAuthority(value) === authority),
        };
        try {
            await client.cancelQueries(queries);
            // Read the latest store value, not a potentially superseded event payload.
            const user = readStoredOidcUser(authority, clientId);
            if (user) {
                await props.auth.events.load(user);
            } else {
                await props.auth.events.unload();
            }
            await client.resetQueries(queries);
        } catch (error) {
            console.error(error);
        }
    });
    return null;
};
