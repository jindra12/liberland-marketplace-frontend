import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { DeploymentManifest } from "@liberland/marketplace-contracts";
import type { Account, Wallet } from "thirdweb/wallets";

import { deployVentureContracts } from "./deploymentUtils";
import type { DeploymentValues, DeploymentFlowProps } from "./types";
import {
    deleteRemoteRecovery,
    getRecoveryError,
    loadRemoteRecovery,
    persistRecovery,
    reconcileRemoteRecovery,
} from "./recoveryUtils";

export const useDeploymentFlow = (props: DeploymentFlowProps) => {
    const key = `venture-deployment:${props.deploymentKey}:${props.account.address}`;
    const [runnerId, setRunnerId] = useState(() => window.crypto.randomUUID());
    const queryClient = useQueryClient();
    const recoveryQuery = useQuery({
        queryKey: [key],
        queryFn: () => loadRemoteRecovery(props, key, runnerId),
        refetchOnWindowFocus: false,
    });
    const recovery = recoveryQuery.data;
    const synchronize = (update: Parameters<typeof persistRecovery>[2]) =>
        persistRecovery(props, key, (previous) => ({ ...update(previous), runnerId }));
    const saveMutation = useMutation({
        mutationFn: async (manifest: DeploymentManifest) => {
            await synchronize((previous) => previous!);
            await props.onSave(manifest);
        },
        onSuccess: async () => {
            await synchronize((previous) => ({ ...previous!, saved: true }));
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
        onError: async (error) => {
            console.error(error);
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
    });
    const deploymentMutation = useMutation({
        mutationFn: async (request: { values: DeploymentValues; account: Account; wallet: Wallet }) => {
            const acquired = await synchronize(
                (previous) =>
                    previous || {
                        values: request.values,
                        transactions: [],
                        progress: [],
                        manifest: null,
                    },
            );
            return deployVentureContracts(
                request.values,
                request.account,
                request.wallet,
                async (transaction) => {
                    await synchronize((previous) => ({
                        ...previous!,
                        progress: [
                            ...previous!.progress.filter((entry) => entry.label !== transaction.label),
                            transaction,
                        ],
                    }));
                    await queryClient.invalidateQueries({ queryKey: [key] });
                },
                acquired.transactions,
                async (transaction) => {
                    await synchronize((previous) => ({
                        ...previous!,
                        transactions: [...previous!.transactions, transaction],
                    }));
                    await queryClient.invalidateQueries({ queryKey: [key] });
                },
                async () => {
                    await synchronize((previous) => previous!);
                },
            );
        },
        onSuccess: async (manifest) => {
            await synchronize((previous) => ({ ...previous!, manifest }));
            await queryClient.invalidateQueries({ queryKey: [key] });
            saveMutation.mutate(manifest);
        },
        onError: async (error) => {
            console.error(error);
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
    });
    const reconciliation = useMutation({
        mutationFn: async (action: "takeover" | "abandon" | "restart") => {
            if (action === "restart") {
                await deleteRemoteRecovery(props, key);
                return;
            }
            await reconcileRemoteRecovery(props, key, recovery!, runnerId, action);
        },
        onSuccess: async (_result, action) => {
            deploymentMutation.reset();
            saveMutation.reset();
            if (action === "abandon" || action === "restart") {
                setRunnerId(window.crypto.randomUUID());
            }
            await queryClient.invalidateQueries({ queryKey: [key] });
        },
        onError: (error) => {
            console.error(error);
        },
    });
    return {
        ready: recoveryQuery.isSuccess && !recoveryQuery.isFetching,
        retryLoad: () => {
            reconciliation.reset();
            return recoveryQuery.refetch();
        },
        busy:
            recoveryQuery.isPending ||
            deploymentMutation.isPending ||
            saveMutation.isPending ||
            reconciliation.isPending,
        error: getRecoveryError(
            recoveryQuery.error || reconciliation.error || saveMutation.error || deploymentMutation.error,
        ),
        recovery,
        owned: !recovery?.runnerId || recovery.runnerId === runnerId,
        reconcile: (action: "takeover" | "abandon") => reconciliation.mutate(action),
        manifest: recovery?.manifest || null,
        recoveryValues: recovery?.values,
        progress: recovery?.progress || [],
        saved: Boolean(recovery?.saved),
        startAnotherDeployment: () => reconciliation.mutate("restart"),
        deploy: (values: DeploymentValues, account: Account, wallet: Wallet) =>
            deploymentMutation.mutate({ values, account, wallet }),
        retrySave: () => saveMutation.mutate(recovery!.manifest!),
    };
};
