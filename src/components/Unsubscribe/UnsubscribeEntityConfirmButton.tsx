import * as React from "react";

import { Button } from "antd";

import { useSubscriptionActions } from "../share/SubscribeButton/useSubscriptionActions";
import { getSubscriptionErrorMessage } from "../share/SubscribeButton/utils";

import type { UnsubscribeConfirmButtonProps } from "./types";
import { isAlreadyUnsubscribedError } from "./utils";

export const UnsubscribeEntityConfirmButton: React.FunctionComponent<
    UnsubscribeConfirmButtonProps
> = (props) => {
    const subscriptionActions = useSubscriptionActions({
        collection: props.params.collection,
        targetID: props.params.id,
        serverURL: props.entity.serverURL,
    });

    const handleConfirm = async () => {
        try {
            await subscriptionActions.unsubscribe(props.params.email);
            props.messageApi.success(
                `You will no longer receive ${subscriptionActions.entityLabel} update emails for ${props.entity.title}.`,
            );
            props.onComplete();
        } catch (error) {
            if (isAlreadyUnsubscribedError(error)) {
                props.messageApi.success(
                    `That ${subscriptionActions.entityLabel} subscription had already been removed.`,
                );
                props.onComplete();
                return;
            }

            props.messageApi.error(
                getSubscriptionErrorMessage(
                    error,
                    "unsubscribe",
                    subscriptionActions.entityLabel,
                ),
            );
        }
    };

    return (
        <Button
            type="primary"
            className="UnsubscribePage__primaryAction"
            onClick={handleConfirm}
            loading={subscriptionActions.isPending}
        >
            Yes, unsubscribe me
        </Button>
    );
};
