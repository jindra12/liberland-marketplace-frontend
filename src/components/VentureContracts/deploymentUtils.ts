import { deployMarketplaceFromBrowser } from "@liberland/marketplace-contracts/deployment/browser";
import { deploymentArtifacts } from "@liberland/marketplace-contracts/deployment/artifacts";
import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { parseUnits } from "ethers";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import type { Account, Wallet } from "thirdweb/wallets";

import { ventureWalletClient } from "./constants";
import type { DeploymentProgress, DeploymentValues } from "./types";
import { getVentureChain } from "./utils";

export const deployVentureContracts = async (
    values: DeploymentValues,
    account: Account,
    wallet: Wallet,
    report: (progress: DeploymentProgress) => void,
) => {
    const configuration = deploymentNetworks[values.deploymentNetwork];
    const chain = getVentureChain(configuration.chainId);
    await wallet.switchChain(chain);
    const signer = ethers6Adapter.signer.toEthers({ client: ventureWalletClient, chain, account });
    const bytecodes = await Promise.all([
        signer.provider!.getCode(configuration.poolManagerAddress),
        signer.provider!.getCode(configuration.positionManagerAddress),
        signer.provider!.getCode(configuration.permit2Address),
    ]);
    if (bytecodes.some((bytecode) => bytecode === "0x")) {
        throw new Error("The configured V4 infrastructure is unavailable on this network.");
    }
    return deployMarketplaceFromBrowser({
        ...configuration,
        ...deploymentArtifacts,
        signer,
        tokenName: values.tokenName,
        tokenSymbol: values.tokenSymbol,
        initialSupply: parseUnits(values.initialSupply, 18),
        onTransaction: async (label, receipt) => report({ label, hash: receipt.hash }),
    });
};
