import { useEffect } from "react";
import { useAnalytics } from "use-analytics";
import useLocalStorage from "use-local-storage";
import type { TrackAnalyticsEventMutationVariables } from "../../generated/graphql";
import { BACKEND_URL } from "../../gqlFetcher";
import { useTrackAnalyticsEventMutation } from "../hooks";
import { ANALYTICS_IDENTITIES_KEY } from "./constants";
import type { AnalyticsIdentitiesByBackend, AnalyticsMutationEvent, AnalyticsPagePayload, AnalyticsTrackPayload } from "./types";
import { sanitizeAnalyticsRoute } from "./utils";

export const useAnalyticsMutationBridge = () => {
    const analytics = useAnalytics();
    const [identities, setIdentities] = useLocalStorage<AnalyticsIdentitiesByBackend>(ANALYTICS_IDENTITIES_KEY, {});
    const { mutateAsync } = useTrackAnalyticsEventMutation();

    useEffect(() => {
        const trackEvent = async (event: AnalyticsMutationEvent) => {
            const url = event.targetUrl || BACKEND_URL;
            const identity = identities?.[url];
            const input: TrackAnalyticsEventMutationVariables["input"] = {
                type: event.type,
                distinctId: identity?.distinctId,
                sessionId: identity?.sessionId,
                metadata: event.metadata,
                route: event.route ? sanitizeAnalyticsRoute(event.route) : undefined,
            };
            try {
                const result = await mutateAsync({ input, url });
                const next = result.trackAnalyticsEvent.analytics;
                setIdentities((current) => {
                    if (current?.[url]?.distinctId === next.distinctId && current[url].sessionId === next.sessionId) {
                        return current;
                    }
                    return { ...current, [url]: { distinctId: next.distinctId, sessionId: next.sessionId } };
                });
            } catch (error) {
                console.error(`Failed to send analytics event "${event.type}".`, error);
            }
        };
        const unsubscribePage = analytics.on("page", ({ payload }: { payload: AnalyticsPagePayload }) => {
            trackEvent({ type: "pageview", route: payload.properties.route, targetUrl: payload.options?.targetUrl });
        });
        const unsubscribeTrack = analytics.on("track", ({ payload }: { payload: AnalyticsTrackPayload }) => {
            const { route, ...metadata } = payload.properties;
            trackEvent({ type: payload.event, route, metadata, targetUrl: payload.options?.targetUrl });
        });
        return () => {
            unsubscribePage();
            unsubscribeTrack();
        };
    }, [analytics, identities, mutateAsync, setIdentities]);
};
