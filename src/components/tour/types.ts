import type { TourStepProps } from "antd";

export type TourType =
    | "home"
    | "jobs"
    | "job-detail"
    | "companies"
    | "company-detail"
    | "tribes"
    | "tribe-detail"
    | "products"
    | "product-detail"
    | "posts"
    | "post-detail"
    | "ventures"
    | "venture-detail"
    | "profile"
    | "profile-wallets"
    | "profile-address"
    | "publish"
    | "publish-job"
    | "publish-company"
    | "publish-product"
    | "publish-post"
    | "publish-startup"
    | "cart"
    | "order"
    | "syndication"
    | "syndication-detail"
    | "syndicate";

export type Category = "publish-job" | "publish-company" | "publish-product" | "publish-post" | "publish-startup";

export type TourPhase = "intro" | "main";

export type TourStepDescriptor = {
    title: string;
    description: string;
    placement?: TourStepProps["placement"];
    selector?: string;
};

export type TourStepConfig = Omit<TourStepProps, "target">;

export type TourRenderMode = "desktop" | "mobile";

export type TourDefinition = {
    type: TourType;
    route: string;
    requiresAuth: boolean;
    desktop: TourStepDescriptor[];
    mobile: TourStepDescriptor[];
    introDesktop?: TourStepDescriptor[];
    introMobile?: TourStepDescriptor[];
    targetRoute?: string;
};

export type TourRenderState = {
    open: boolean;
    current: number;
    steps: TourStepConfig[];
    onClose: () => void;
    onChange: (next: number) => void;
};

export type TourContextState = {
    activeTourType: TourType | "auth-prompt" | null;
    authPromptTourType: TourType | null;
    pendingTourType: TourType | undefined;
};

export type TourConfigMap = Record<TourType, TourDefinition>;

export type TourTargetResolver = () => HTMLElement | null;

export type TourUrlLocation = {
    pathname: string;
    search: string;
    hash: string;
};

export type TourHashPayload = {
    type: TourType;
};

export type TourPathMatch = {
    route: string;
    exact?: boolean;
};

export type TourState = {
    activeType: TourType | "auth-prompt" | null;
    currentStep: number;
};
