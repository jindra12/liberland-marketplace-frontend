import { useMeUserQuery } from "../hooks";

export const useServerUser = (serverUrl?: string | null) => {
    const query = useMeUserQuery({ url: serverUrl }, { enabled: Boolean(serverUrl) });
    return {
        user: query.data?.find((entry) => entry.serverURL === serverUrl)?.meUser?.user,
        isLoading: query.isLoading,
    };
};
