import axios from "axios";
import { z } from "zod";
import { gqlFetcher } from "../../gqlFetcher";
import {
    VentureDeploymentRecoveryDocument,
    SaveVentureDeploymentRecoveryDocument,
    DeleteVentureDeploymentRecoveryDocument,
    ReconcileVentureDeploymentRecoveryDocument,
    type VentureDeploymentRecoveryQuery,
    type VentureDeploymentRecoveryQueryVariables,
    type SaveVentureDeploymentRecoveryMutation,
    type SaveVentureDeploymentRecoveryMutationVariables,
    type DeleteVentureDeploymentRecoveryMutation,
    type DeleteVentureDeploymentRecoveryMutationVariables,
    type ReconcileVentureDeploymentRecoveryMutation,
    type ReconcileVentureDeploymentRecoveryMutationVariables,
    type VentureDeploymentRecoveryInput,
} from "../../generated/graphql";
import type { DeploymentFlowProps, DeploymentRecovery } from "./types";

export const getRecoveryError = (error: Error | null): string => {
    if (!error) {
        return "";
    }
    if (axios.isAxiosError<{ error?: string }>(error)) {
        return error.response?.data?.error || error.message;
    }
    return error.message;
};

export const readDeploymentRecovery = (key: string): DeploymentRecovery | null => {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as DeploymentRecovery) : null;
};

// Persist synchronously before the deployment runner waits for the receipt or submits another step.
export const writeDeploymentRecovery = (
    key: string,
    update: (previous: DeploymentRecovery | null) => DeploymentRecovery,
) => {
    const record = update(readDeploymentRecovery(key));
    window.localStorage.setItem(key, JSON.stringify(record));
    return record;
};

export const clearDeploymentRecovery = (key: string) => window.localStorage.removeItem(key);

const recoveryVariables = (props: DeploymentFlowProps) => ({
    ventureId: props.ventureId,
    walletAddress: props.account.address,
});

// pendingSync is a browser journal flag, not part of the backend input schema.
const recoveryInput = (record: DeploymentRecovery): VentureDeploymentRecoveryInput => ({
    values: record.values,
    transactions: record.transactions,
    progress: record.progress,
    manifest: record.manifest,
    saved: record.saved,
    runnerId: record.runnerId,
});

const readRemoteRecovery = (
    record: VentureDeploymentRecoveryQuery["ventureRecoveryRecord"],
): DeploymentRecovery | null => {
    if (!record) {
        return null;
    }
    return {
        values: {
            ...record.values,
            deploymentNetwork: z.enum(["ethereum", "sepolia", "localhost"]).parse(record.values.deploymentNetwork),
        },
        transactions: record.transactions.map((step) => ({
            label: step.label,
            hash: step.hash,
            ...(step.nonce !== null ? { nonce: step.nonce } : {}),
            ...(step.chainId !== null ? { chainId: step.chainId } : {}),
            ...(step.submittedAtBlock !== null ? { submittedAtBlock: step.submittedAtBlock } : {}),
        })),
        progress: record.progress,
        manifest: record.manifest,
        ...(record.saved !== null ? { saved: record.saved } : {}),
        ...(record.runnerId !== null ? { runnerId: record.runnerId } : {}),
    };
};

export const saveRemoteRecovery = async (props: DeploymentFlowProps, record: DeploymentRecovery) => {
    const response = await gqlFetcher<
        SaveVentureDeploymentRecoveryMutation,
        SaveVentureDeploymentRecoveryMutationVariables
    >(
        SaveVentureDeploymentRecoveryDocument,
        { ...recoveryVariables(props), record: recoveryInput(record) },
        undefined,
        props.serverURL,
    )();
    return readRemoteRecovery(response.saveVentureDeploymentRecovery)!;
};

export const loadRemoteRecovery = async (
    props: DeploymentFlowProps,
    key: string,
    runnerId: string,
): Promise<DeploymentRecovery | null> => {
    const response = await gqlFetcher<VentureDeploymentRecoveryQuery, VentureDeploymentRecoveryQueryVariables>(
        VentureDeploymentRecoveryDocument,
        recoveryVariables(props),
        undefined,
        props.serverURL,
    )();
    const local = readDeploymentRecovery(key);
    const remote = readRemoteRecovery(response.ventureRecoveryRecord);
    // Preserve the hash if an earlier backend save failed after the wallet broadcast.
    if (local?.pendingSync) {
        const synchronized = { ...local, runnerId: local.runnerId || remote?.runnerId || runnerId };
        const saved = await saveRemoteRecovery(props, synchronized);
        return writeDeploymentRecovery(key, () => ({ ...saved, pendingSync: false }));
    }
    if (remote) {
        writeDeploymentRecovery(key, () => remote);
    } else {
        clearDeploymentRecovery(key);
    }
    return remote;
};

export const persistRecovery = async (
    props: DeploymentFlowProps,
    key: string,
    update: (previous: DeploymentRecovery | null) => DeploymentRecovery,
) => {
    const record = writeDeploymentRecovery(key, (previous) => ({ ...update(previous), pendingSync: true }));
    const saved = await saveRemoteRecovery(props, record);
    return writeDeploymentRecovery(key, () => ({ ...saved, pendingSync: false }));
};

export const deleteRemoteRecovery = async (props: DeploymentFlowProps, key: string) => {
    await gqlFetcher<DeleteVentureDeploymentRecoveryMutation, DeleteVentureDeploymentRecoveryMutationVariables>(
        DeleteVentureDeploymentRecoveryDocument,
        recoveryVariables(props),
        undefined,
        props.serverURL,
    )();
    clearDeploymentRecovery(key);
};

export const reconcileRemoteRecovery = async (
    props: DeploymentFlowProps,
    key: string,
    record: DeploymentRecovery,
    runnerId: string,
    action: "takeover" | "abandon",
) => {
    const response = await gqlFetcher<
        ReconcileVentureDeploymentRecoveryMutation,
        ReconcileVentureDeploymentRecoveryMutationVariables
    >(
        ReconcileVentureDeploymentRecoveryDocument,
        { ...recoveryVariables(props), action, record: recoveryInput(record), runnerId, confirmed: true },
        undefined,
        props.serverURL,
    )();
    const remote = readRemoteRecovery(response.reconcileVentureDeploymentRecovery);
    if (remote) {
        writeDeploymentRecovery(key, () => remote);
    } else {
        clearDeploymentRecovery(key);
    }
};
