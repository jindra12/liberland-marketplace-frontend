import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Flex } from "antd";
import { mount } from "cypress/react";
import { ZeroAddress, parseEther } from "ethers";
import type { ReactNode } from "react";
import type { DaoProposal } from "@liberland/marketplace-contracts/client/governance";
import type { TradeQuote, VenturePool } from "@liberland/marketplace-contracts/client/trading";

import { AntProvider } from "../../src/components/AntProvider";
import { savedDeployment } from "./ventureContracts";

export const mountVentureMarket = (component: ReactNode) =>
    mount(
        <AntProvider>
            <QueryClientProvider
                client={new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })}
            >
                <Flex vertical className="VentureContracts">
                    {component}
                </Flex>
            </QueryClientProvider>
        </AntProvider>,
    );

export const venturePool: VenturePool = {
    id: `0x${"1".repeat(64)}`,
    key: {
        currency0: ZeroAddress,
        currency1: savedDeployment.tokenAddress!,
        fee: 3000,
        tickSpacing: 60,
        hooks: ZeroAddress,
    },
    currency0: { address: ZeroAddress, symbol: "ETH", decimals: 18 },
    currency1: { address: savedDeployment.tokenAddress!, symbol: "HBR", decimals: 18 },
};

export const quoteVentureTrade = async (input: string, amount: bigint, slippageBps: number): Promise<TradeQuote> => {
    const amountOut = input === ZeroAddress ? amount * 2000n : amount / 2000n;
    return {
        pool: venturePool,
        zeroForOne: input === ZeroAddress,
        amountIn: amount,
        amountOut,
        minimumOut: (amountOut * BigInt(10000 - slippageBps)) / 10000n,
        routerFeeBps: 25,
        slippageBps,
        quotedAt: Date.now(),
    };
};

export const activeProposal: DaoProposal = {
    id: "1258093647338295",
    proposer: savedDeployment.deployerWalletAddress || savedDeployment.tokenAddress!,
    description: "Set the monthly rooted-holder reward to 5 HBR reward tokens.",
    targets: [savedDeployment.daoAddress!],
    values: [0n],
    calldatas: ["0x12345678"],
    snapshot: 1791196800n,
    deadline: 1791801600n,
    eta: 0n,
    timestamp: 1791200400n,
    state: 1,
    against: parseEther("20"),
    for: parseEther("500"),
    abstain: parseEther("40"),
    quorum: parseEther("400"),
    quorumIsProjected: false,
    hasVoted: false,
    votingPower: parseEther("200"),
};
