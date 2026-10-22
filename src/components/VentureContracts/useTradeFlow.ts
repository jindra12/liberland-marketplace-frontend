import { Form } from "antd";
import type { FormInstance } from "antd";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parseUnits } from "ethers";

import { sameAddress } from "./marketUtils";
import type { TradeFormProps, TradeValues } from "./types";

export const useTradeFlow = (props: TradeFormProps, form: FormInstance<TradeValues>) => {
    const values: TradeValues | undefined = Form.useWatch([], form);
    const token = sameAddress(props.pool.currency0.address, props.tokenAddress)
        ? props.pool.currency0
        : props.pool.currency1;
    const counter = sameAddress(props.pool.currency0.address, props.tokenAddress)
        ? props.pool.currency1
        : props.pool.currency0;
    const input = values?.side === "sell" ? token : counter;
    const output = values?.side === "sell" ? counter : token;
    const valid = Boolean(
        values?.amount &&
        /^\d+(\.\d+)?$/.test(values.amount) &&
        Number(values.amount) > 0 &&
        (values.amount.split(".")[1]?.length || 0) <= input.decimals,
    );
    const query = useQuery({
        queryKey: ["venture-quote", props.marketKey, props.pool.id, input.address, values?.amount, values?.slippage],
        queryFn: () =>
            props.onQuote(
                input.address,
                parseUnits(values!.amount, input.decimals),
                Math.round(values!.slippage * 100),
            ),
        enabled: valid && Boolean(values?.slippage),
        refetchInterval: 15000,
        retry: false,
    });
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: () => {
            if (!query.data || query.isFetching || query.error) {
                throw new Error("Wait for a current quote before trading.");
            }
            return props.onTrade(query.data);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["venture-quote"] });
            await queryClient.invalidateQueries({ queryKey: ["venture-contract-account"] });
        },
        onError: (error) => console.error(error),
    });
    return { query, mutation, input, output, side: values?.side || "buy" };
};
