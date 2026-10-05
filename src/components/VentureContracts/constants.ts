import { createThirdwebClient } from "thirdweb";

export const ventureWalletClient = createThirdwebClient({ clientId: process.env.REACT_APP_THIRDWEB! });
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
