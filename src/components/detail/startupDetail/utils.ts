import { getImage } from "../../shared/image/utils";

import type { StartupDetailEntity } from "./types";

export const getStartupDetailImage = (startup: StartupDetailEntity) => {
    return getImage(startup) || getImage(startup.company);
};

export const getStartupIdentity = (startup: StartupDetailEntity) => {
    if (!startup.identity?.name) {
        return undefined;
    }

    return {
        id: startup.identity.id,
        name: startup.identity.name,
    };
};

export const getStartupShareText = (startup: StartupDetailEntity) => {
    return `Check out ${startup.title || "Venture"} on NSwap.`;
};
