import { MarketplaceSwapClient } from "@liberland/marketplace-contracts/client/trading";
import { MarketplaceDaoClient } from "@liberland/marketplace-contracts/client/governance";
import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { getAddress, parseUnits } from "ethers";
import { ethers6Adapter } from "thirdweb/adapters/ethers6";
import axios from "axios";
import { BACKEND_URL, getAccessToken } from "../../gqlFetcher";

import { ventureWalletClient } from "./constants";
import type {
    ProposalRequest,
    ProposalValues,
    VentureDeployment,
    VentureMarketProps,
    VentureIndexSnapshot,
} from "./types";
import { getVentureChain } from "./utils";

export const fetchVentureIndex = async (props: VentureMarketProps): Promise<VentureIndexSnapshot> => {
    if (!props.ventureId || !props.deployment.id) {
        throw new Error("Save this deployment to its Venture before loading its persisted market index.");
    }
    const serverURL = props.serverURL || BACKEND_URL;
    const token = getAccessToken(serverURL);
    const result = await axios.get<VentureIndexSnapshot>(
        `${serverURL}/api/startups/${encodeURIComponent(props.ventureId)}/contract-index`,
        {
            params: { deploymentId: props.deployment.id },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
    );
    return result.data;
};

export const getVentureProvider = (deployment: VentureDeployment) =>
    ethers6Adapter.provider.toEthers({
        client: ventureWalletClient,
        chain: getVentureChain(Number(deployment.chainId)),
    });

export const getVentureSigner = async (props: VentureMarketProps) => {
    if (!props.account || !props.wallet) {
        throw new Error("Connect your wallet to submit a transaction.");
    }
    const chain = getVentureChain(Number(props.deployment.chainId));
    await props.wallet.switchChain(chain);
    return ethers6Adapter.signer.toEthers({ client: ventureWalletClient, chain, account: props.account });
};

export const getVentureSwapClient = (deployment: VentureDeployment) => {
    const network = Object.values(deploymentNetworks).find((item) => item.chainId === Number(deployment.chainId));
    if (!network || !deployment.swapRouterAddress || !deployment.poolManagerAddress) {
        throw new Error("Trading infrastructure is not configured for this deployment.");
    }
    return new MarketplaceSwapClient(
        {
            router: deployment.swapRouterAddress,
            poolManager: deployment.poolManagerAddress,
            quoter: network.quoterAddress,
        },
        getVentureProvider(deployment),
    );
};

export const getVentureDaoClient = (deployment: VentureDeployment) =>
    new MarketplaceDaoClient(
        {
            dao: deployment.daoAddress!,
            token: deployment.tokenAddress!,
            router: deployment.swapRouterAddress!,
        },
        getVentureProvider(deployment),
    );

export const submitProposalAction = async (props: VentureMarketProps, request: ProposalRequest) => {
    const client = new MarketplaceDaoClient(
        {
            dao: props.deployment.daoAddress!,
            token: props.deployment.tokenAddress!,
            router: props.deployment.swapRouterAddress!,
        },
        await getVentureSigner(props),
    );
    switch (request.action) {
        case "vote":
            return client.vote(request.proposal.id, request.support!, request.reason || "");
        case "queue":
            return client.queue(request.proposal);
        case "execute":
            return client.execute(request.proposal);
        case "cancel":
            return client.cancel(request.proposal);
    }
};

export const createVentureProposal = async (props: VentureMarketProps, values: ProposalValues) => {
    const client = new MarketplaceDaoClient(
        {
            dao: props.deployment.daoAddress!,
            token: props.deployment.tokenAddress!,
            router: props.deployment.swapRouterAddress!,
        },
        await getVentureSigner(props),
    );
    return client.propose({
        kind: values.kind,
        description: values.description,
        address: values.address,
        target: values.target,
        initialization: values.initialization,
        amount: proposalAmount(values, props.deployment.tokenDecimals ?? 18),
    });
};

const proposalAmount = (values: ProposalValues, decimals: number) => {
    switch (values.kind) {
        case "fee":
            return parseUnits(values.amount, 2);
        case "quorum":
        case "voting-delay":
        case "voting-period":
            return BigInt(values.amount);
        case "enable-upgrades":
        case "freeze-upgrades":
        case "upgrade":
            return 0n;
        default:
            return parseUnits(values.amount, decimals);
    }
};

export const sameAddress = (first: string, second: string) => getAddress(first) === getAddress(second);

export const validatePositiveAmount = async (_rule: object, value: string) => {
    if (!value || !/^\d+(\.\d+)?$/.test(value) || Number(value) <= 0) {
        throw new Error("Enter a positive token amount.");
    }
};
