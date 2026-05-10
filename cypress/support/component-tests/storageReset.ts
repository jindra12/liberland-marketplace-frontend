import { routes } from "../../../src/routes";

export type StorageResetTarget = {
    localStorage: Pick<Storage, "clear">;
    location: Pick<Location, "replace">;
};

export const clearLocalStorageAndGoHome = (props: StorageResetTarget) => {
    props.localStorage.clear();
    props.location.replace(routes.home.route);
};
