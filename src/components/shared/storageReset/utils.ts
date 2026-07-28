import { routes } from "../../../routes";

export const clearLocalStorageAndGoHome = () => {
    window.localStorage.clear();
    window.location.replace(routes.home.route);
};
