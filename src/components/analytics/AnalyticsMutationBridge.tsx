import * as React from "react";

import { useAnalytics } from "use-analytics";
import useLocalStorage from "use-local-storage";

import { BACKEND_URL } from "../../gqlFetcher";
import { useTrackAnalyticsEventMutation } from "../hooks";

import { ANALYTICS_DISTINCT_ID_KEY, ANALYTICS_SESSION_ID_KEY } from "./constants";
import type { AnalyticsMutationEvent, AnalyticsPagePayload, AnalyticsTrackPayload } from "./types";

export const AnalyticsMutationBridge: React.FunctionComponent = () => {
    const analytics = useAnalytics();
    const [distinctId, setDistinctId] = useLocalStorage<string | null>(ANALYTICS_DISTINCT_ID_KEY, null);
    const [sessionId, setSessionId] = useLocalStorage<string | null>(ANALYTICS_SESSION_ID_KEY, null);
    const mutation = useTrackAnalyticsEventMutation();

    const trackEvent = React.useCallback(
        async (event: AnalyticsMutationEvent) => {
            try {
                const result = await mutation.mutateAsync({
                    input: {
                        distinctId,
                        metadata: event.metadata,
                        route: event.route,
                        sessionId,
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
        },
        [distinctId, mutation, sessionId, setDistinctId, setSessionId],
    );

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
