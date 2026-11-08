import { useReadLocalStorage, useSessionStorage } from "usehooks-ts";

import { AUTH_URL_SESSION_STORAGE_KEY, AUTH_URL_STORAGE_KEY } from "./constants";

export const useAuthServerStorage = (defaultUrl: string) => {
    const savedUrl = useReadLocalStorage<string>(AUTH_URL_STORAGE_KEY);
    return useSessionStorage<string>(AUTH_URL_SESSION_STORAGE_KEY, savedUrl || defaultUrl);
};
