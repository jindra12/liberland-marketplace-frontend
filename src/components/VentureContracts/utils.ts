import type { DeploymentManifest } from "@liberland/marketplace-contracts";
import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { formatUnits } from "ethers";
import { defineChain } from "thirdweb";

import { StartupUpdate_ContractDeployments_Chain_MutationInput } from "../../generated/graphql";
import type { VentureDeployment } from "./types";

export const getVentureChain = (chainId: number) => {
    const configuration = Object.values(deploymentNetworks).find((network) => network.chainId === chainId);
    return configuration?.rpcUrl
        ? defineChain({
              id: chainId,
              name: configuration.label,
              rpc: configuration.rpcUrl,
              nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
              testnet: true,
          })
        : defineChain(chainId);
};

export const toSavedDeployment = (manifest: DeploymentManifest) => ({
    chain:
        manifest.chain === "ethereum"
            ? StartupUpdate_ContractDeployments_Chain_MutationInput.Ethereum
            : StartupUpdate_ContractDeployments_Chain_MutationInput.Tron,
    network: manifest.network,
    chainId: manifest.chainId,
    deployedAt: manifest.deployedAt,
    tokenName: manifest.token.name,
    tokenSymbol: manifest.token.symbol,
    tokenDecimals: manifest.token.decimals,
    initialSupply: manifest.token.initialSupply,
    deployerWalletAddress: manifest.deployer,
    tokenAddress: manifest.token.address,
    daoAddress: manifest.dao.address,
    rewardTokenAddress: manifest.dao.rewardToken,
    timelockAddress: manifest.dao.timelock,
    forwarderAddress: manifest.implementations.forwarder,
    swapRouterAddress: manifest.swap.address,
    poolManagerAddress: manifest.swap.poolManager,
    positionManagerAddress: manifest.swap.positionManager,
    permit2Address: manifest.swap.permit2,
    tokenImplementationAddress: manifest.implementations.token,
    daoImplementationAddress: manifest.implementations.dao,
    rewardTokenImplementationAddress: manifest.implementations.rewardToken,
    swapRouterImplementationAddress: manifest.implementations.swapRouter,
    timelockImplementationAddress: manifest.implementations.timelock,
});

export const getAddressLink = (deployment: VentureDeployment, address: string): string | undefined => {
    if (deployment.chain === "tron") {
        return deployment.network === "mainnet" ? `https://tronscan.org/#/address/${address}` : undefined;
    }
    switch (deployment.chainId) {
        case "1":
            return `https://etherscan.io/address/${address}`;
        case "11155111":
            return `https://sepolia.etherscan.io/address/${address}`;
        default:
            return undefined;
    }
};

export const formatTokenAmount = (amount: string, decimals: number) => formatUnits(amount, decimals);
