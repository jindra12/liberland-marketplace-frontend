import axios from "axios";
import { BACKEND_URL, getAccessToken } from "../../gqlFetcher";
import type { DeploymentFlowProps, DeploymentRecovery } from "./types";

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

const recoveryRequest = (props: DeploymentFlowProps) => {
    const serverURL = props.serverURL || BACKEND_URL;
    const token = getAccessToken(serverURL);
    return {
        url: `${serverURL}/api/startups/${encodeURIComponent(props.ventureId)}/deployment-recovery`,
        config: {
            params: { walletAddress: props.account.address },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
    };
};

export const saveRemoteRecovery = async (props: DeploymentFlowProps, record: DeploymentRecovery) => {
    const request = recoveryRequest(props);
    await axios.put(request.url, record, request.config);
};

export const loadRemoteRecovery = async (
    props: DeploymentFlowProps,
    key: string,
): Promise<DeploymentRecovery | null> => {
    const request = recoveryRequest(props);
    const response = await axios.get<{ record: DeploymentRecovery | null }>(request.url, request.config);
    const local = readDeploymentRecovery(key);
    const remote = response.data.record;
    // Preserve the hash if an earlier backend save failed after the wallet broadcast.
    if (local?.pendingSync && (!remote || local.transactions.length >= remote.transactions.length)) {
        await saveRemoteRecovery(props, local);
        return writeDeploymentRecovery(key, () => ({ ...local, pendingSync: false }));
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
    await saveRemoteRecovery(props, record);
    writeDeploymentRecovery(key, () => ({ ...record, pendingSync: false }));
};

export const deleteRemoteRecovery = async (props: DeploymentFlowProps, key: string) => {
    const request = recoveryRequest(props);
    await axios.delete(request.url, request.config);
    clearDeploymentRecovery(key);
};
