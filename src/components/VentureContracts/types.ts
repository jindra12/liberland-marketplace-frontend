import type { DeploymentManifest, DeploymentTransaction } from "@liberland/marketplace-contracts";
import type { DeploymentNetwork } from "@liberland/marketplace-contracts/deployment/networks";
import type { Account, Wallet } from "thirdweb/wallets";
import type { StartupByIdQuery } from "../../generated/graphql";
import type { TradeQuote, VenturePool } from "@liberland/marketplace-contracts/client/trading";
import type {
    DaoProposal,
    DaoProposalInput,
    DaoProposalRecord,
} from "@liberland/marketplace-contracts/client/governance";

export type VentureDeployment = NonNullable<NonNullable<StartupByIdQuery["Startup"]>["contractDeployments"]>[number];
export type DeploymentValues = {
    tokenName: string;
    tokenSymbol: string;
    initialSupply: string;
    tokensPerEth: string;
    deploymentNetwork: DeploymentNetwork;
    acknowledged: boolean;
};
export type DeploymentFormProps = {
    ventureName: string;
    busy: boolean;
    onDeploy: (values: DeploymentValues) => Promise<void> | void;
};
export type DeploymentProgress = { label: string; hash: string };
export type DeploymentRecovery = {
    values: DeploymentValues;
    transactions: DeploymentTransaction[];
    progress: DeploymentProgress[];
    manifest: DeploymentManifest | null;
    saved?: boolean;
    pendingSync?: boolean;
};
export type VentureContractsProps = {
    venture: NonNullable<StartupByIdQuery["Startup"]>;
    serverURL?: string | null;
    section?: VentureContractSection;
};
export type VentureContractSection = "token" | "account" | "exchange" | "liquidity" | "dao";
export type VentureDeploymentPanelProps = VentureContractsProps;
export type SaveDeployment = (manifest: DeploymentManifest) => Promise<void>;

export type DeploymentWalletProps = {
    ventureName: string;
    deploymentKey: string;
    ventureId: string;
    serverURL?: string | null;
    onSave: SaveDeployment;
};

export type DeploymentFlowProps = DeploymentWalletProps & {
    account: Account;
    wallet: Wallet;
};

export type DeploymentSummaryProps = {
    deployment: VentureDeployment;
    ventureId?: string;
    serverURL?: string | null;
};

export type VentureIndexSnapshot = {
    pools: VenturePool[];
    proposals: DaoProposalRecord[];
    lastBlock: number;
    blockHash: string;
    hasMore: boolean;
};

export type TokenWalletProps = DeploymentSummaryProps & { section: VentureContractSection };

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

export type VentureMarketProps = DeploymentSummaryProps & {
    account?: Account;
    wallet?: Wallet;
};
export type TradingPanelProps = VentureMarketProps & { section?: "exchange" | "liquidity" };
export type LiquidityControlsProps = VentureMarketProps & { pool?: VenturePool };
export type LiquidityValues = {
    action: "mint" | "inspect" | "withdraw" | "collect" | "close";
    ethAmount: string;
    tokenAmount: string;
    slippage: number;
    tokenId: string;
    liquidity: string;
    minimumEth: string;
    minimumTokens: string;
};
export type LiquidityFormProps = {
    connected: boolean;
    decimals: number;
    onSubmit: (values: LiquidityValues) => Promise<string>;
};
export type TradeValues = { side: "buy" | "sell"; amount: string; slippage: number };
export type TradeFormProps = {
    marketKey: string;
    pool: VenturePool;
    tokenAddress: string;
    connected: boolean;
    onQuote: (input: string, amount: bigint, slippageBps: number) => Promise<TradeQuote>;
    onTrade: (quote: TradeQuote) => Promise<string>;
};
export type ProposalAction = "vote" | "queue" | "execute" | "cancel";
export type ProposalRequest = { proposal: DaoProposal; action: ProposalAction; support?: number; reason?: string };
export type DaoProposalCardProps = {
    proposal: DaoProposal;
    decimals: number;
    connected: boolean;
    busy: boolean;
    onAction: (request: ProposalRequest) => void;
};
export type ProposalValues = {
    kind: DaoProposalInput["kind"];
    amount: string;
    address: string;
    description: string;
    target?: DaoProposalInput["target"];
    initialization?: string;
    acknowledged?: boolean;
};
export type ProposalFormProps = { busy: boolean; onSubmit: (values: ProposalValues) => void };
