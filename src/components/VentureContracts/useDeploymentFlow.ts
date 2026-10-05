import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { DeploymentManifest } from "@liberland/marketplace-contracts";
import type { Account, Wallet } from "thirdweb/wallets";

import { deployVentureContracts } from "./deploymentUtils";
import type { DeploymentProgress, DeploymentValues, SaveDeployment } from "./types";

export const useDeploymentFlow = (save: SaveDeployment) => {
    const [progress, setProgress] = useState<DeploymentProgress[]>([]);
    const saveMutation = useMutation({
        mutationFn: (manifest: DeploymentManifest) => save(manifest),
        onError: (error) => console.error(error),
    });
    const deploymentMutation = useMutation({
        mutationFn: (request: { values: DeploymentValues; account: Account; wallet: Wallet }) =>
            deployVentureContracts(request.values, request.account, request.wallet, (transaction) => {
                setProgress((previous) => [...previous, transaction]);
            }),
        onMutate: () => setProgress([]),
        onSuccess: (manifest) => saveMutation.mutate(manifest),
        onError: (error) => console.error(error),
    });
    return {
        busy: deploymentMutation.isPending || saveMutation.isPending,
        error: saveMutation.error?.message || deploymentMutation.error?.message || "",
        manifest: deploymentMutation.data || null,
        progress,
        saved: saveMutation.isSuccess,
        deploy: (values: DeploymentValues, account: Account, wallet: Wallet) =>
            deploymentMutation.mutate({ values, account, wallet }),
        retrySave: () => saveMutation.mutate(deploymentMutation.data!),
    };
};
