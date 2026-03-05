import * as React from "react";
import { useInterval } from "usehooks-ts";
import Result from "antd/es/result";
import Progress from "antd/es/progress";
import ReactScrollIntoViewIfNeededInternal from "react-scroll-into-view-if-needed";
import { secondsLimit } from "../../constants";
import { UseMutationResult } from "@tanstack/react-query";
import { Button } from "antd";

const ReactScrollIntoViewIfNeeded = ReactScrollIntoViewIfNeededInternal as any as React.FunctionComponent<React.PropsWithChildren>;

export interface PaymentManagerProps {
    query: UseMutationResult<{ success: boolean }>;
    onSuccess: () => void;
}

export const PaymentManager: React.FunctionComponent<PaymentManagerProps> = (props) => {
    const [seconds, setSeconds] = React.useState(secondsLimit);
    const isSuccess = props.query.isSuccess && props.query.data?.success;
    useInterval(() => {
        if (!props.query.isPending) {
            setSeconds(!seconds ? secondsLimit : seconds - 1);
        }
    }, 1000);
    
    React.useEffect(() => {
        if (seconds === 0 && !props.query.isPending && !props.query.isError) {
            props.query.mutate({});
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seconds]);

    React.useEffect(() => {
        if (isSuccess) {
            props.onSuccess();
        }
    }, [isSuccess, props]);


    if (props.query.isError) {
        return (
            <Result status="500" title="Payment confirmation failed" subTitle={<Button type="primary" onClick={() => props.query.reset()}>Retry</Button>} />
        );
    }

    return (
        <ReactScrollIntoViewIfNeeded>
            <Result
                title="Processing payment"
                className="ProcessingPayment"
                extra={(
                    <Progress
                        percent={(100 / secondsLimit) * (secondsLimit - seconds)}
                        status={props.query.isError ? "exception" : props.query.isSuccess ? "success" : "normal"}
                        format={(percent) => {
                            if (props.query.isPending) {
                                return "Refreshing";
                            }
                            if (props.query.isError) {
                                return "Error!";
                            }
                            if (props.query.isSuccess && props.query.data) {
                                return "Done!";
                            }
                            if (percent === 100) {
                                return "Refreshing";
                            }
                            return `Refreshing in ${seconds}s`;
                        }}
                    />
                )}
            />
        </ReactScrollIntoViewIfNeeded>
    );
};