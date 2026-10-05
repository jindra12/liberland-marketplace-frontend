import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Account, Wallet } from "thirdweb/wallets";

import { readVentureAccount, submitVentureAccountAction } from "./accountUtils";
import type { VentureDeployment, VentureAccountAction, VentureActionValues } from "./types";

export const useVentureAccount = (deployment: VentureDeployment, account: Account, wallet: Wallet) => {
    const queryClient = useQueryClient();
    const queryKey = ["venture-contract-account", deployment.chainId, deployment.tokenAddress, account.address];
    const query = useQuery({ queryKey, queryFn: () => readVentureAccount(deployment, account.address) });
    const mutation = useMutation({
        mutationFn: (request: { action: VentureAccountAction; values: VentureActionValues }) =>
            submitVentureAccountAction(deployment, account, wallet, request.action, request.values),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => console.error(error),
    });
    return { query, mutation };
};
