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
import { ENTITY_LABELS } from "./constants";
import { buildNotificationSubscriptionID, getSubscriptionMutationURL, invalidateSubscriptionQueries } from "./utils";
import type { SubscribeButtonProps } from "./types";

type SubscriptionActionOptions = Pick<SubscribeButtonProps, "collection" | "targetID" | "serverURL" | "subscriptionID">;

export const useSubscriptionActions = ({ collection, targetID, serverURL, subscriptionID }: SubscriptionActionOptions) => {
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

    const subscribe = async (email: string) => {
        if (!targetID) {
            throw new Error("Missing subscription target.");
        }

        await mutationConfig.subscribe.mutateAsync({
            email,
            targetID,
            url: mutationURL,
        });

        await invalidateSubscriptionQueries(queryClient, collection);
    };

    const unsubscribe = async (email: string) => {
        if (!targetID) {
            throw new Error("Missing subscription target.");
        }

        const resolvedSubscriptionID =
            subscriptionID ||
            (await buildNotificationSubscriptionID({
                email,
                targetCollection: collection,
                targetID,
            }));

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
