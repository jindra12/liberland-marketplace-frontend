import type { QueryClient } from "@tanstack/react-query";
import { BACKEND_URL } from "../../../gqlFetcher";
import { SUBSCRIPTION_QUERY_KEY_TERMS } from "./constants";
import type { NotificationTargetCollection, SubscriptionAction } from "./types";

const digestSubscriptionID = async (value: string) => {
    if (!window.crypto?.subtle) {
        throw new Error("Secure hashing is unavailable in this browser.");
    }

    const encoded = new TextEncoder().encode(value);
    const digest = await window.crypto.subtle.digest("SHA-256", encoded);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
};

export const buildNotificationSubscriptionID = async ({
    email,
    targetCollection,
    targetID,
}: {
    email: string;
    targetCollection: NotificationTargetCollection;
    targetID: string;
}) => digestSubscriptionID(`${email.toLowerCase()}::${targetCollection}::${targetID}`);

export const getSubscribeButtonClassName = (className?: string) =>
    ["SubscribeButton", className].filter(Boolean).join(" ");

export const getSubscriptionMutationURL = (serverURL?: string | null) => serverURL || BACKEND_URL;

export const invalidateSubscriptionQueries = async (
    queryClient: QueryClient,
    collection: NotificationTargetCollection,
) => {
    const queryKeyTerms = SUBSCRIPTION_QUERY_KEY_TERMS[collection];
    await queryClient.invalidateQueries({
        predicate: (query) => {
            const root = query.queryKey[0];
            if (typeof root !== "string") {
                return false;
            }

            const normalizedRoot = root.toLowerCase();
            return queryKeyTerms.some((term) => normalizedRoot.includes(term));
        },
    });
};

export const getSubscriptionErrorMessage = (error: unknown, action: SubscriptionAction, entityLabel: string) => {
    if (error instanceof Error && error.message) {
        return error.message;
    }

    if (action === "unsubscribe") {
        return `Could not unsubscribe from ${entityLabel} updates.`;
    }

    return `Could not subscribe to ${entityLabel} updates.`;
};
