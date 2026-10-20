import * as React from "react";

import { Alert, Button, Flex, Select, Skeleton, Statistic, Typography } from "antd";
import { formatUnits } from "ethers";

import { ventureAccountActions } from "./constants";
import { TokenActionForm } from "./TokenActionForm";
import type { TokenAccountProps, VentureAccountAction } from "./types";
import { useVentureAccount } from "./useVentureAccount";

export const TokenAccount: React.FunctionComponent<TokenAccountProps> = (props) => {
    const model = useVentureAccount(props.deployment, props.account, props.wallet);
    const [action, setAction] = React.useState<VentureAccountAction>("root");
    if (model.query.isPending) {
        return <Skeleton active />;
    }
    if (model.query.error) {
        return (
            <Alert
                type="error"
                message={model.query.error.message}
                action={<Button onClick={() => model.query.refetch()}>Retry contract reads</Button>}
            />
        );
    }
    return (
        <Flex vertical gap={16}>
            <Typography.Text copyable>Connected: {props.account.address}</Typography.Text>
            <Flex gap={28} wrap>
                <Statistic
                    title="Liquid tokens"
                    value={formatUnits(model.query.data.liquid, props.deployment.tokenDecimals ?? 18)}
                />
                <Statistic
                    title="Rooted tokens"
                    value={formatUnits(model.query.data.rooted, props.deployment.tokenDecimals ?? 18)}
                />
                <Statistic
                    title="Delegated votes"
                    value={formatUnits(model.query.data.votes, props.deployment.tokenDecimals ?? 18)}
                />
                <Statistic title="Reward tokens" value={formatUnits(model.query.data.rewards, 18)} />
            </Flex>
            <Alert
                type="info"
                message={
                    model.query.data.rewardPerPeriod === 0n
                        ? "The DAO has not enabled reward emissions yet."
                        : `Reward per eligible claim: ${formatUnits(model.query.data.rewardPerPeriod, 18)}`
                }
                description={
                    model.query.data.rooted > 0n
                        ? `Next claim eligibility: ${new Date(Number(model.query.data.eligibleAt) * 1000).toLocaleString()}`
                        : "Root tokens continuously for 30 days to become eligible. Delegate rooted votes to yourself or another address to use them."
                }
            />
            {model.mutation.error && <Alert type="error" showIcon message={model.mutation.error.message} />}
            {model.mutation.data && (
                <Typography.Text copyable>Confirmed transaction: {model.mutation.data}</Typography.Text>
            )}
            <Select<VentureAccountAction>
                aria-label="Token action"
                value={action}
                onChange={setAction}
                options={ventureAccountActions}
                className="VentureContracts__form"
            />
            <TokenActionForm
                action={action}
                busy={model.mutation.isPending}
                onSubmit={(values) => model.mutation.mutateAsync({ action, values })}
            />
        </Flex>
    );
};
