import * as React from "react";
import useLocalStorage from "use-local-storage";
import { useAnalytics } from "use-analytics";
import { BACKEND_URL } from "../../gqlFetcher";
import { useTrackAnalyticsEventMutation } from "../hooks";

const ANALYTICS_DISTINCT_ID_KEY = "analytics.distinctId";
const ANALYTICS_SESSION_ID_KEY = "analytics.sessionId";

type AnalyticsEventOptions = {
    targetUrl?: string;
};

type AnalyticsPagePayload = {
    options?: AnalyticsEventOptions;
    properties: {
        route: string;
    };
};

type AnalyticsGraphqlTrackPayload = {
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

type AnalyticsRuntimeErrorTrackPayload = {
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

type AnalyticsTrackPayload =
    | AnalyticsGraphqlTrackPayload
    | AnalyticsRuntimeErrorTrackPayload;

type AnalyticsMutationEvent = {
    metadata?: Record<string, unknown>;
    route?: string;
    targetUrl?: string;
    type: string;
};

export const AnalyticsMutationBridge: React.FunctionComponent = () => {
    const analytics = useAnalytics();
    const [distinctId, setDistinctId] = useLocalStorage<string | null>(ANALYTICS_DISTINCT_ID_KEY, null);
    const [sessionId, setSessionId] = useLocalStorage<string | null>(ANALYTICS_SESSION_ID_KEY, null);
    const mutation = useTrackAnalyticsEventMutation();

    const trackEvent = React.useCallback(async (event: AnalyticsMutationEvent) => {
        try {
            const result = await mutation.mutateAsync({
                input: {
                    distinctId: distinctId || undefined,
                    metadata: event.metadata,
                    route: event.route,
                    sessionId: sessionId || undefined,
                    type: event.type,
                },
                url: event.targetUrl || BACKEND_URL,
            });
            const analyticsResult = result.trackAnalyticsEvent.analytics;

            if (analyticsResult.distinctId !== distinctId) {
                setDistinctId(analyticsResult.distinctId);
            }

            if (analyticsResult.sessionId !== sessionId) {
                setSessionId(analyticsResult.sessionId);
            }
        } catch (error) {
            console.error(`Failed to send analytics event "${event.type}".`, error);
        }
    }, [
        distinctId,
        mutation,
        sessionId,
        setDistinctId,
        setSessionId,
    ]);

    React.useEffect(() => {
        const unsubscribePage = analytics.on("page", ({ payload }: { payload: AnalyticsPagePayload }) => {
            trackEvent({
                type: "pageview",
                route: payload.properties.route,
                targetUrl: payload.options?.targetUrl,
            });
        });

        const unsubscribeTrack = analytics.on("track", ({ payload }: { payload: AnalyticsTrackPayload }) => {
            const { route, ...metadata } = payload.properties;
            trackEvent({
                type: payload.event,
                route,
                metadata,
                targetUrl: payload.options?.targetUrl,
            });
        });

        return () => {
            unsubscribePage();
            unsubscribeTrack();
        };
    }, [analytics, trackEvent]);

    return null;
};
