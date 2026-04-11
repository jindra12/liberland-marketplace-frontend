export type AnalyticsEventOptions = {
    targetUrl?: string;
};

export type AnalyticsPagePayload = {
    options?: AnalyticsEventOptions;
    properties: {
        route: string;
    };
};

export type AnalyticsGraphqlTrackPayload = {
    event: string;
    options?: AnalyticsEventOptions;
    properties: {
        durationMs: number;
        errorMessage?: string;
        operationName: string;
        operationType: string;
        route: string;
        success: boolean;
        variables?: object;
    };
};

export type AnalyticsRuntimeErrorTrackPayload = {
    event: "runtime.error";
    options?: AnalyticsEventOptions;
    properties: {
        boundary: "app" | "route";
        componentStack: string;
        message: string;
        name: string;
        route: string;
        stack?: string;
    };
};

export type AnalyticsTrackPayload = AnalyticsGraphqlTrackPayload | AnalyticsRuntimeErrorTrackPayload;

export type AnalyticsMutationEvent = {
    metadata?: Record<string, unknown>;
    route?: string;
    targetUrl?: string;
    type: string;
};
