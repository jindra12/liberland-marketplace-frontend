import * as React from "react";

import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router-dom";

import { routes } from "../../routes";

import { TOUR_DEFINITIONS } from "./constants";
import { useTourServiceState } from "./TourServiceState";
import type { TourType } from "./types";
import { isRouteMatch } from "./utils";

const getTourDefinition = (type: TourType) => TOUR_DEFINITIONS[type];

export const TourRouteListener: React.FunctionComponent = () => {
    const auth = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const {
        activeTourType,
        authPromptDismissed,
        pendingTourType,
        setActiveTourType,
        setCurrentStep,
        setPendingTourType,
    } = useTourServiceState();

    React.useEffect(() => {
        if (!pendingTourType) {
            return;
        }

        const definition = getTourDefinition(pendingTourType);
        if (definition.requiresAuth && !auth.isAuthenticated) {
            if (location.pathname !== routes.home.route) {
                navigate(routes.home.route, { replace: true });
            }

            if (!authPromptDismissed) {
                setActiveTourType("auth-prompt");
            }

            return;
        }

        const routeMatches = isRouteMatch(location.pathname, definition.route);

        if (!routeMatches) {
            if (definition.targetRoute && location.pathname !== definition.targetRoute) {
                navigate(definition.targetRoute, { replace: true });
            }
            return;
        }

        if (activeTourType !== pendingTourType) {
            setCurrentStep(0);
            setActiveTourType(pendingTourType);
            if (definition.route !== routes.publish.route) {
                setPendingTourType(undefined);
            }
        }
    }, [
        activeTourType,
        auth.isAuthenticated,
        authPromptDismissed,
        navigate,
        location.pathname,
        pendingTourType,
        setActiveTourType,
        setCurrentStep,
        setPendingTourType,
    ]);

    return null;
};
