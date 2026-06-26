import { useQueryClient } from "@tanstack/react-query";

import {
    useSubscribeToCompanyUpdatesMutation,
    useSubscribeToJobUpdatesMutation,
    useSubscribeToProductUpdatesMutation,
    useSubscribeToTribeUpdatesMutation,
    useSubscribeToVentureUpdatesMutation,
    useUnsubscribeFromCompanyUpdatesMutation,
    useUnsubscribeFromJobUpdatesMutation,
    useUnsubscribeFromProductUpdatesMutation,
    useUnsubscribeFromTribeUpdatesMutation,
    useUnsubscribeFromVentureUpdatesMutation,
} from "../../hooks";
import { createAuthManager } from "../../auth/utils";
import { ENTITY_LABELS } from "./constants";
import { buildNotificationSubscriptionID, getSubscriptionMutationURL, invalidateSubscriptionQueries } from "./utils";
import type { SubscribeButtonProps } from "./types";

type SubscriptionActionOptions = Pick<SubscribeButtonProps, "collection" | "targetID" | "serverURL">;

export const useSubscriptionActions = ({
    collection,
    targetID,
    serverURL,
}: SubscriptionActionOptions) => {
    const queryClient = useQueryClient();

    const subscribeCompany = useSubscribeToCompanyUpdatesMutation();
    const subscribeJob = useSubscribeToJobUpdatesMutation();
    const subscribeProduct = useSubscribeToProductUpdatesMutation();
    const subscribeTribe = useSubscribeToTribeUpdatesMutation();
    const subscribeVenture = useSubscribeToVentureUpdatesMutation();

    const unsubscribeCompany = useUnsubscribeFromCompanyUpdatesMutation();
    const unsubscribeJob = useUnsubscribeFromJobUpdatesMutation();
    const unsubscribeProduct = useUnsubscribeFromProductUpdatesMutation();
    const unsubscribeTribe = useUnsubscribeFromTribeUpdatesMutation();
    const unsubscribeVenture = useUnsubscribeFromVentureUpdatesMutation();

    const mutationConfig = {
        companies: {
            subscribe: subscribeCompany,
            unsubscribe: unsubscribeCompany,
        },
        identities: {
            subscribe: subscribeTribe,
            unsubscribe: unsubscribeTribe,
        },
        jobs: {
            subscribe: subscribeJob,
            unsubscribe: unsubscribeJob,
        },
        products: {
            subscribe: subscribeProduct,
            unsubscribe: unsubscribeProduct,
        },
        startups: {
            subscribe: subscribeVenture,
            unsubscribe: unsubscribeVenture,
        },
    }[collection];

    const mutationURL = getSubscriptionMutationURL(serverURL);

    const subscribe = async () => {
        if (!targetID) {
            throw new Error("Missing subscription target.");
        }

        await mutationConfig.subscribe.mutateAsync({
            targetID,
            url: mutationURL,
        });

        await invalidateSubscriptionQueries(queryClient, collection);
    };

    const unsubscribe = async () => {
        if (!targetID) {
            throw new Error("Missing subscription target.");
        }

        const authManager = createAuthManager(mutationURL);
        const authUser = await authManager.getUser();
        const authenticatedEmail =
            typeof authUser?.profile?.email === "string" ? authUser.profile.email : undefined;
        const resolvedSubscriptionID = authenticatedEmail
            ? buildNotificationSubscriptionID({
                  email: authenticatedEmail,
                  targetCollection: collection,
                  targetID,
              })
            : undefined;

        if (!resolvedSubscriptionID) {
            throw new Error("Missing subscription ID.");
        }

        await mutationConfig.unsubscribe.mutateAsync({
            subscriptionID: resolvedSubscriptionID,
            url: mutationURL,
        });

        await invalidateSubscriptionQueries(queryClient, collection);
    };

    return {
        entityLabel: ENTITY_LABELS[collection],
        isPending: mutationConfig.subscribe.isPending || mutationConfig.unsubscribe.isPending,
        subscribe,
        unsubscribe,
    };
};
