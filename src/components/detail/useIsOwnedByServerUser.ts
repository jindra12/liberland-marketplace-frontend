import { useMeUserQuery } from "../hooks";
import { getAccessToken } from "../../gqlFetcher";

type UseIsOwnedByServerUserProps = {
    ownerUserId?: string | null;
    serverURL?: string | null;
};

export const useIsOwnedByServerUser = (props: UseIsOwnedByServerUserProps) => {
    const meUserQuery = useMeUserQuery(props.serverURL ? { url: props.serverURL } : undefined, {
        enabled: Boolean(props.serverURL && props.ownerUserId && getAccessToken(props.serverURL)),
    });
    const currentUserId = meUserQuery.data?.[0]?.meUser?.user?.id;

    return Boolean(props.ownerUserId && currentUserId && props.ownerUserId === currentUserId);
};
