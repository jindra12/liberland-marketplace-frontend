import * as React from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { TOUR_DEFINITIONS } from "./constants";
import { useTourServiceState } from "./TourServiceState";
import type { TourType } from "./types";
import { TOUR_HASH_PREFIX, parseTourHash } from "./utils";

const getTourDefinition = (type: TourType) => TOUR_DEFINITIONS[type];

export const TourHashListener: React.FunctionComponent = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setAuthPromptDismissed, setPendingTourType } = useTourServiceState();

    React.useEffect(() => {
        const hash = location.hash;
        if (!hash.startsWith(TOUR_HASH_PREFIX)) {
            return;
        }

        const payload = parseTourHash(hash);
        navigate(`${location.pathname}${location.search}`, { replace: true });

        if (!payload) {
            return;
        }

        const definition = getTourDefinition(payload.type);
        if (!definition) {
            return;
        }

        setAuthPromptDismissed(false);
        setPendingTourType(payload.type);
    }, [location.hash, location.pathname, location.search, navigate, setAuthPromptDismissed, setPendingTourType]);

    return null;
};
