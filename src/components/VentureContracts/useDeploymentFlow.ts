import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { DeploymentManifest } from "@liberland/marketplace-contracts";
import type { Account, Wallet } from "thirdweb/wallets";

import { deployVentureContracts } from "./deploymentUtils";
import type { DeploymentValues, DeploymentFlowProps } from "./types";
import { deleteRemoteRecovery, loadRemoteRecovery, persistRecovery } from "./recoveryUtils";

export const useDeploymentFlow = (props: DeploymentFlowProps) => {
    const key = `venture-deployment:${props.deploymentKey}:${props.account.address}`;
    const queryClient = useQueryClient();
    const recoveryQuery = useQuery({
        queryKey: [key],
        queryFn: () => loadRemoteRecovery(props, key),
        refetchOnWindowFocus: false,
    });
    const recovery = recoveryQuery.data;
    const saveMutation = useMutation({
        mutationFn: (manifest: DeploymentManifest) => props.onSave(manifest),
        onSuccess: async () => {
            await persistRecovery(props, key, (previous) => ({ ...previous!, saved: true }));
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
        onError: async (error) => {
            console.error(error);
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
    });
    const deploymentMutation = useMutation({
        mutationFn: async (request: { values: DeploymentValues; account: Account; wallet: Wallet }) => {
            const transactions = recovery?.transactions || [];
            if (!recovery) {
                await persistRecovery(props, key, () => ({
                    values: request.values,
                    transactions: [],
                    progress: [],
                    manifest: null,
                }));
            }
            return deployVentureContracts(
                request.values,
                request.account,
                request.wallet,
                async (transaction) => {
                    await persistRecovery(props, key, (previous) => ({
                        ...previous!,
                        progress: [
                            ...previous!.progress.filter((entry) => entry.label !== transaction.label),
                            transaction,
                        ],
                    }));
                    await queryClient.invalidateQueries({ queryKey: [key] });
                },
                transactions,
                async (transaction) => {
                    await persistRecovery(props, key, (previous) => ({
                        ...previous!,
                        transactions: [...previous!.transactions, transaction],
                    }));
                    await queryClient.invalidateQueries({ queryKey: [key] });
                },
            );
        },
        onSuccess: async (manifest) => {
            await persistRecovery(props, key, (previous) => ({ ...previous!, manifest }));
            await queryClient.invalidateQueries({ queryKey: [key] });
            saveMutation.mutate(manifest);
        },
        onError: async (error) => {
            console.error(error);
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
    });
    return {
        ready: recoveryQuery.isSuccess && !recoveryQuery.isFetching,
        retryLoad: () => recoveryQuery.refetch(),
        busy: recoveryQuery.isPending || deploymentMutation.isPending || saveMutation.isPending,
        error: recoveryQuery.error?.message || saveMutation.error?.message || deploymentMutation.error?.message || "",
        manifest: recovery?.manifest || null,
        recoveryValues: recovery?.values,
        progress: recovery?.progress || [],
        saved: Boolean(recovery?.saved),
        startAnotherDeployment: async () => {
            await deleteRemoteRecovery(props, key);
            deploymentMutation.reset();
            saveMutation.reset();
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
        deploy: (values: DeploymentValues, account: Account, wallet: Wallet) =>
            deploymentMutation.mutate({ values, account, wallet }),
        retrySave: () => saveMutation.mutate(recovery!.manifest!),
    };
};
