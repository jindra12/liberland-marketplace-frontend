import { NOTIFICATION_TARGET_FRONTEND_PATHS, NOTIFICATION_TARGET_QUERY_TYPE_TO_COLLECTION } from "./constants";
import type { NotificationTargetCollection } from "../share/SubscribeButton/types";
import type { UnsubscribeParseResult } from "./types";

const SAFE_ENTITY_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/;
const SAFE_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MISSING_SUBSCRIPTION_PATTERN = /not found|no document/i;

export const parseUnsubscribeSearchParams = (searchParams: URLSearchParams): UnsubscribeParseResult => {
    const queryType = searchParams.get("type");
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!queryType || !id || !email) {
        return {
            isValid: false,
            reason: "This unsubscribe link is missing required details.",
        };
    }

    const collection = NOTIFICATION_TARGET_QUERY_TYPE_TO_COLLECTION[queryType];
    if (!collection) {
        return {
            isValid: false,
            reason: "This unsubscribe link does not target a supported notification type.",
        };
    }

    if (!SAFE_ENTITY_ID_PATTERN.test(id)) {
        return {
            isValid: false,
            reason: "This unsubscribe link contains an invalid item ID.",
        };
    }

    if (email.length > 254 || !SAFE_EMAIL_PATTERN.test(email)) {
        return {
            isValid: false,
            reason: "This unsubscribe link contains an invalid email address.",
        };
    }

    return {
        isValid: true,
        params: {
            collection,
            queryType,
            id,
            email,
        },
    };
};

export const getNotificationDetailPath = (
    collection: NotificationTargetCollection,
    id: string,
) => `/${NOTIFICATION_TARGET_FRONTEND_PATHS[collection]}/${id}`;

export const isAlreadyUnsubscribedError = (error: unknown) =>
    error instanceof Error && MISSING_SUBSCRIPTION_PATTERN.test(error.message);
