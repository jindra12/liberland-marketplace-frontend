import { V4PositionClient } from "@liberland/marketplace-contracts";
import { deploymentNetworks } from "@liberland/marketplace-contracts/deployment/networks";
import { parseUnits } from "ethers";

import { getVentureSigner } from "./marketUtils";
import type { LiquidityControlsProps, LiquidityValues } from "./types";

export const submitVentureLiquidity = async (
    props: LiquidityControlsProps,
    values: LiquidityValues,
): Promise<string> => {
    const network = Object.values(deploymentNetworks).find((item) => item.chainId === Number(props.deployment.chainId));
    if (!network || !props.pool) {
        throw new Error("An indexed pool and configured network are required.");
    }
    const client = new V4PositionClient(
        props.deployment.positionManagerAddress!,
        props.deployment.permit2Address!,
        await getVentureSigner(props),
    );
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);
    const decimals = props.deployment.tokenDecimals ?? 18;
    if (values.action === "mint") {
        const quote = await client.quoteFullRange(
            props.pool,
            network.stateViewAddress,
            parseUnits(values.ethAmount, 18),
            parseUnits(values.tokenAmount, decimals),
            Math.round(values.slippage * 100),
        );
        await client.approveCurrency(props.pool.key.currency1, quote.amount1Maximum, Number(deadline));
        const result = await client.mintPosition({
            ...quote,
            poolKey: props.pool.key,
            recipient: props.account!.address,
            deadline,
        });
        return `Position receipt #${result.tokenId}: ${result.transactionHash}`;
    }
    const tokenId = BigInt(values.tokenId);
    const available = await client.verifyPosition(tokenId, props.pool.key);
    switch (values.action) {
        case "inspect":
            return `Position receipt #${tokenId}: ${available} liquidity units. Owned by your connected wallet in this pool.`;
        case "close":
            if (available !== 0n) {
                throw new Error("Withdraw all liquidity before closing this position.");
            }
            return client.burnEmptyPosition(tokenId, props.pool.key, deadline);
        case "collect":
            return client.collectFees({
                tokenId,
                poolKey: props.pool.key,
                deadline,
                amount0Limit: 0n,
                amount1Limit: 0n,
            });
        case "withdraw": {
            const liquidity = BigInt(values.liquidity);
            if (liquidity <= 0n || liquidity > available) {
                throw new Error(`Enter liquidity units between 1 and ${available}.`);
            }
            return client.decreaseLiquidity({
                tokenId,
                liquidity,
                poolKey: props.pool.key,
                deadline,
                amount0Limit: parseUnits(values.minimumEth, 18),
                amount1Limit: parseUnits(values.minimumTokens, decimals),
            });
        }
    }
};
