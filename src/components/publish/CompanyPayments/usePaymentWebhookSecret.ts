import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    GenerateCompanyPaymentSecretDocument,
    RotateCompanyPaymentSecretDocument,
    type GenerateCompanyPaymentSecretMutation,
    type GenerateCompanyPaymentSecretMutationVariables,
    type RotateCompanyPaymentSecretMutation,
    useCompanyPaymentSettingsQuery,
} from "../../../generated/graphql";
import { gqlFetcher } from "../../../gqlFetcher";

export const usePaymentWebhookSecret = (companyId: string, serverUrl: string) => {
    const client = useQueryClient();
    const [secret, setSecret] = useState("");
    const [hasIssued, setHasIssued] = useState(false);
    const mutation = useMutation({
        mutationFn: async (action: "generate" | "rotate") => {
            const result = await gqlFetcher<
                GenerateCompanyPaymentSecretMutation | RotateCompanyPaymentSecretMutation,
                GenerateCompanyPaymentSecretMutationVariables
            >(
                action === "generate" ? GenerateCompanyPaymentSecretDocument : RotateCompanyPaymentSecretDocument,
                { companyId },
                undefined,
                serverUrl,
            )();
            // Keep the one-time value out of TanStack's mutation/query caches.
            setSecret(result.paymentSecret!.secret);
            setHasIssued(true);
        },
        gcTime: 0,
        retry: false,
        onSuccess: async () => {
            await client.invalidateQueries({
                queryKey: [...useCompanyPaymentSettingsQuery.getKey({ companyId }), serverUrl],
            });
        },
    });
    return { secret, hasIssued, mutation, dismiss: () => setSecret("") };
};
