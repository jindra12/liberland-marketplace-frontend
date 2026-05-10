import { matchPath } from "react-router-dom";

import type { TourProps } from "antd";

import type {
    Category,
    TourDefinition,
    TourHashPayload,
    TourRenderMode,
    TourStepConfig,
    TourStepDescriptor,
    TourType,
} from "./types";

export const TOUR_HASH_PREFIX = "#tour-";
export const TOUR_LOCAL_STORAGE_KEY = "tour.session";

export const parseTourHash = (hash: string): TourHashPayload | null => {
    if (!hash || !hash.startsWith(TOUR_HASH_PREFIX)) {
        return null;
    }

    const rawType = hash.slice(TOUR_HASH_PREFIX.length);
    const type = rawType as TourType;

    return type ? { type } : null;
};

export const buildTourHash = (type: TourType) => `${TOUR_HASH_PREFIX}${type}`;

export const stripTourHash = (pathname: string, search: string) => `${pathname}${search}`;

export const toTarget = (selector?: string) => {
    if (!selector) {
        return undefined;
    }

    return () => document.querySelector(selector) as HTMLElement | null;
};

export const buildTourSteps = (descriptors: TourStepDescriptor[]): TourStepConfig[] =>
    descriptors.map((descriptor) => ({
        title: descriptor.title,
        description: descriptor.description,
        placement: descriptor.placement,
        target: toTarget(descriptor.selector),
    }));

export const buildTourDescriptor = (
    title: string,
    description: string,
    selector?: string,
    placement?: TourStepDescriptor["placement"],
): TourStepDescriptor => ({
    title,
    description,
    selector,
    placement,
});

export const selectTourSteps = (
    definition: TourDefinition,
    mode: TourRenderMode,
    phase: "intro" | "main",
): TourStepConfig[] => {
    const descriptors =
        phase === "intro"
            ? mode === "mobile"
                ? definition.introMobile ?? definition.mobile
                : definition.introDesktop ?? definition.desktop
            : mode === "mobile"
              ? definition.mobile
              : definition.desktop;

    return buildTourSteps(descriptors);
};

export const isRouteMatch = (pathname: string, pattern: string) => Boolean(matchPath({ path: pattern, end: true }, pathname));

export const isAnyRouteMatch = (pathname: string, patterns: string[]) =>
    patterns.some((pattern) => isRouteMatch(pathname, pattern));

export const getLocationPath = (pathname: string, search: string) => `${pathname}${search}`;

export const isTourType = (value: string): value is TourType => {
    return value.length > 0;
};

export const isPublishTourType = (value: TourType) =>
    value === "publish-job" ||
    value === "publish-company" ||
    value === "publish-product" ||
    value === "publish-post" ||
    value === "publish-startup";

export const getTourCategory = (value: TourType | undefined): Category | undefined => {
    if (!value || !isPublishTourType(value)) {
        return undefined;
    }

    return value;
};

export const getTourSharePlacement = (mode: TourRenderMode) => (mode === "mobile" ? "top" : "right") as TourProps["placement"];
