import type { MeUserQuery } from "../../generated/graphql";

export type BackendUserQuery = MeUserQuery & { serverURL?: string };

export type SourceQualifiedEntity = {
    id: string;
    serverURL?: string | null;
    identity?: { id: string; serverURL?: string | null } | null;
    allowedIdentities?: { id: string; serverURL?: string | null }[] | null;
    disallowedIdentities?: { id: string; serverURL?: string | null }[] | null;
    company?: {
        id?: string;
        serverURL?: string | null;
        identity?: { id: string; serverURL?: string | null } | null;
        allowedIdentities?: { id: string; serverURL?: string | null }[] | null;
    } | null;
};

export type BackendResponseValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | BackendResponseValue[]
    | { [key: string]: BackendResponseValue };
