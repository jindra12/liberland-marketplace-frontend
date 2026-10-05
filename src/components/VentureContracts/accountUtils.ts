import { VentureClient } from "@liberland/marketplace-contracts/client/venture";
import { parseUnits } from "ethers";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import type { Account, Wallet } from "thirdweb/wallets";

import { ventureWalletClient } from "./constants";
import type { VentureDeployment, VentureAccountAction, VentureActionValues } from "./types";
import { getVentureChain } from "./utils";

const getVentureContractAddresses = (deployment: VentureDeployment) => ({
    token: deployment.tokenAddress!,
    dao: deployment.daoAddress!,
    rewards: deployment.rewardTokenAddress!,
});

export const readVentureAccount = async (deployment: VentureDeployment, address: string) => {
    const provider = ethers6Adapter.provider.toEthers({
        client: ventureWalletClient,
        chain: getVentureChain(Number(deployment.chainId)),
    });
    return new VentureClient(getVentureContractAddresses(deployment), provider).readAccount(address);
};

export const submitVentureAccountAction = async (
    deployment: VentureDeployment,
    account: Account,
    wallet: Wallet,
    action: VentureAccountAction,
    values: VentureActionValues,
) => {
    const chain = getVentureChain(Number(deployment.chainId));
    await wallet.switchChain(chain);
    const signer = ethers6Adapter.signer.toEthers({ client: ventureWalletClient, chain, account });
    const client = new VentureClient(getVentureContractAddresses(deployment), signer);
    switch (action) {
        case "root":
            return client.root(parseUnits(values.amount, deployment.tokenDecimals ?? 18));
        case "delegate":
            return client.delegate(values.address);
        case "transfer":
            return client.transfer(values.address, parseUnits(values.amount, deployment.tokenDecimals ?? 18));
        case "claim":
            return client.claim();
        case "redeem":
            return client.redeem(
                parseUnits(values.amount, 18),
                parseUnits(values.minimum, deployment.tokenDecimals ?? 18),
            );
    }
};
