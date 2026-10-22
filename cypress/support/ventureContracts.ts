import type { DeploymentManifest, VentureAccountSnapshot } from "@liberland/marketplace-contracts";
import { parseEther } from "ethers";

import { Startup_ContractDeployments_Chain } from "../../src/generated/graphql";
import type { VentureDeployment } from "../../src/components/VentureContracts/types";
import { MAIN_SERVER_URL } from "./component-tests/constants";

export const deploymentManifest: DeploymentManifest = {
    chain: "ethereum",
    network: "mainnet",
    chainId: "1",
    deployedAt: "2026-10-05T12:00:00.000Z",
    deployer: "0x1111111111111111111111111111111111111111",
    implementations: {
        forwarder: "0x2222222222222222222222222222222222222222",
        token: "0x3333333333333333333333333333333333333333",
        dao: "0x4444444444444444444444444444444444444444",
        rewardToken: "0x5555555555555555555555555555555555555555",
        swapRouter: "0x6666666666666666666666666666666666666666",
        timelock: "0x7777777777777777777777777777777777777777",
    },
    token: {
        address: "0x8888888888888888888888888888888888888888",
        name: "Harbor Venture",
        symbol: "HBR",
        decimals: 18,
        initialSupply: parseEther("21000000").toString(),
    },
    swap: {
        address: "0x9999999999999999999999999999999999999999",
        poolManager: "0x000000000004444c5dc75cB358380D2e3dE08A90",
        positionManager: "0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e",
        permit2: "0x000000000022D473030F116dDEE9F6B43aC78BA3",
    },
    dao: {
        address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        timelock: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
        rewardToken: "0xcccccccccccccccccccccccccccccccccccccccc",
    },
};
export const savedDeployment: VentureDeployment = {
    id: "saved-deployment",
    chain: Startup_ContractDeployments_Chain.Ethereum,
    network: "mainnet",
    chainId: "1",
    tokenName: "Harbor Venture",
    tokenSymbol: "HBR",
    tokenDecimals: 18,
    initialSupply: deploymentManifest.token.initialSupply,
    tokenAddress: deploymentManifest.token.address,
    daoAddress: deploymentManifest.dao.address,
    rewardTokenAddress: deploymentManifest.dao.rewardToken,
    swapRouterAddress: deploymentManifest.swap.address,
    timelockAddress: deploymentManifest.dao.timelock,
    poolManagerAddress: deploymentManifest.swap.poolManager,
    positionManagerAddress: deploymentManifest.swap.positionManager,
    permit2Address: deploymentManifest.swap.permit2,
};
export const emptyVenture = {
    id: "venture-harbor",
    title: "Harbor Venture",
    serverURL: MAIN_SERVER_URL,
    createdBy: { id: "user-nova" },
    contractDeployments: [],
};
export const accountSnapshot: VentureAccountSnapshot = {
    balance: parseEther("1200"),
    liquid: parseEther("1000"),
    rooted: parseEther("200"),
    votes: parseEther("200"),
    rewards: parseEther("12"),
    rewardPerPeriod: parseEther("3"),
    eligibleAt: 1791196800n,
    timestamp: 1791196801n,
};
