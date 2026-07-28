import useLocalStorage from "use-local-storage";

import { NSFW_CONSENT_STORAGE_KEY } from "./constants";

export const useNsfwConsent = () => {
    return useLocalStorage<boolean>(NSFW_CONSENT_STORAGE_KEY, false);
};
