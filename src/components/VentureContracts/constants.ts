import { createThirdwebClient } from "thirdweb";
import type { VentureContractSection } from "./types";

export const ventureContractSections: { key: VentureContractSection; label: string }[] = [
    { key: "token", label: "Token" },
    { key: "account", label: "Balances & rewards" },
    { key: "exchange", label: "Exchange" },
    { key: "liquidity", label: "Liquidity" },
    { key: "dao", label: "Voting" },
];
export const ventureAccountActions = [
    { value: "root", label: "Root tokens" },
    { value: "delegate", label: "Vote delegation" },
    { value: "transfer", label: "Transfer tokens" },
    { value: "claim", label: "Claim rewards" },
    { value: "redeem", label: "Redeem rewards" },
];

export const ventureWalletClient = createThirdwebClient({ clientId: process.env.REACT_APP_THIRDWEB! });
export const proposalStateLabels = [
    "Pending",
    "Active",
    "Canceled",
    "Defeated",
    "Succeeded",
    "Queued",
    "Expired",
    "Executed",
];
export const deploymentAddressLabels = {
    tokenAddress: "Token",
    daoAddress: "DAO",
    rewardTokenAddress: "Reward token",
    swapRouterAddress: "Swap router",
    timelockAddress: "Timelock",
    forwarderAddress: "Gas-sponsorship forwarder",
    poolManagerAddress: "PoolManager",
    positionManagerAddress: "PositionManager",
    permit2Address: "Permit2",
    deployerWalletAddress: "Deployer wallet",
    tokenImplementationAddress: "Token implementation",
    daoImplementationAddress: "DAO implementation",
    rewardTokenImplementationAddress: "Reward implementation",
    swapRouterImplementationAddress: "Swap implementation",
    timelockImplementationAddress: "Timelock implementation",
};
