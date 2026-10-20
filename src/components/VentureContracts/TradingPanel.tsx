import * as React from "react";

import { Alert, Button, Empty, Flex, Select, Skeleton, Typography } from "antd";

import { LiquidityControls } from "./LiquidityControls";
import { getVentureSigner, getVentureSwapClient } from "./marketUtils";
import { TradeForm } from "./TradeForm";
import type { TradingPanelProps } from "./types";
import { useVenturePools } from "./useVentureMarket";

export const TradingPanel: React.FunctionComponent<TradingPanelProps> = (props) => {
    const query = useVenturePools(props);
    const [poolId, setPoolId] = React.useState("");
    if (query.isPending) {
        return <Skeleton active />;
    }
    const pools = query.data?.pools || [];
    const pool = pools.find((item) => item.id === poolId) || pools[0];
    return (
        <Flex vertical gap={16}>
            <Typography.Title level={4}>
                {props.section === "liquidity" ? "Manage liquidity" : "Exchange rates & trading"}
            </Typography.Title>
            {query.error && (
                <Alert
                    type="error"
                    message={query.error.message}
                    action={<Button onClick={() => query.refetch()}>Retry pool discovery</Button>}
                />
            )}
            {pool ? (
                <>
                    <Select
                        aria-label="Exchange pool"
                        value={pool.id}
                        onChange={setPoolId}
                        options={pools.map((item) => ({
                            value: item.id,
                            label: `${item.currency0.symbol} / ${item.currency1.symbol} · ${item.key.fee / 10000}% pool fee`,
                        }))}
                    />
                    {props.section !== "liquidity" && (
                        <TradeForm
                            marketKey={`${props.deployment.chainId}:${props.deployment.swapRouterAddress}`}
                            pool={pool}
                            tokenAddress={props.deployment.tokenAddress!}
                            connected={Boolean(props.account && props.wallet)}
                            onQuote={(input, amount, slippage) =>
                                getVentureSwapClient(props.deployment).quote(pool, input, amount, slippage)
                            }
                            onTrade={async (quote) =>
                                getVentureSwapClient(props.deployment).swap(quote, await getVentureSigner(props))
                            }
                        />
                    )}
                </>
            ) : (
                <Empty description="No venture pools have been indexed yet. Trading needs an initialized pool with liquidity." />
            )}
            {query.data?.hasMore && (
                <Alert
                    type="info"
                    message="The backend is indexing the remaining blocks. Results update automatically."
                />
            )}
            {props.section === "liquidity" && <LiquidityControls {...props} pool={pool} />}
        </Flex>
    );
};
