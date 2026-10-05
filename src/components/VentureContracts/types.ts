import type { DeploymentManifest } from "@liberland/marketplace-contracts";
import type { DeploymentNetwork } from "@liberland/marketplace-contracts/deployment/networks";
import type { Account, Wallet } from "thirdweb/wallets";
import type { StartupByIdQuery } from "../../generated/graphql";

export type VentureDeployment = NonNullable<NonNullable<StartupByIdQuery["Startup"]>["contractDeployments"]>[number];
export type DeploymentValues = {
    tokenName: string;
    tokenSymbol: string;
    initialSupply: string;
    deploymentNetwork: DeploymentNetwork;
    acknowledged: boolean;
};
export type DeploymentFormProps = {
    ventureName: string;
    busy: boolean;
    onDeploy: (values: DeploymentValues) => Promise<void> | void;
};
export type DeploymentProgress = { label: string; hash: string };
export type VentureContractsProps = {
    venture: NonNullable<StartupByIdQuery["Startup"]>;
    serverURL?: string | null;
};
export type SaveDeployment = (manifest: DeploymentManifest) => Promise<void>;

export type DeploymentWalletProps = {
    ventureName: string;
    onSave: SaveDeployment;
};

export type DeploymentFlowProps = DeploymentWalletProps & {
    account: Account;
    wallet: Wallet;
};

export type DeploymentSummaryProps = {
    deployment: VentureDeployment;
};

export type TokenWalletProps = DeploymentSummaryProps;

export type TokenAccountProps = DeploymentSummaryProps & {
    account: Account;
    wallet: Wallet;
};

export type VentureAccountAction = "root" | "delegate" | "transfer" | "claim" | "redeem";

export type VentureActionValues = {
    amount: string;
    address: string;
    minimum: string;
    acknowledged: boolean;
};

export type TokenActionFormProps = {
    action: VentureAccountAction;
    busy: boolean;
    onSubmit: (values: VentureActionValues) => Promise<string>;
};
