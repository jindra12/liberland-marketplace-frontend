import * as React from "react";

import { BellFilled, BellOutlined } from "@ant-design/icons";
import { Button, message } from "antd";

import type { SubscribeAuthButtonProps } from "./types";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { getSubscribeButtonClassName, getSubscriptionErrorMessage } from "./utils";

export const SubscribeAuthButton: React.FunctionComponent<SubscribeAuthButtonProps> = (props) => {
    const size = props.size === undefined ? "middle" : props.size;
    const type = props.type === undefined ? "default" : props.type;
    const isSubscribed = Boolean(props.isSubscribed);
    const { entityLabel, isPending, subscribe, unsubscribe } = useSubscriptionActions({
        collection: props.collection,
        targetID: props.targetID,
        serverURL: props.serverURL,
        subscriptionID: props.subscriptionID,
    });

    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            if (isSubscribed) {
                await unsubscribe(props.email);
                props.onSubscriptionChange?.(false);
                message.success(`Unsubscribed from ${entityLabel} updates.`);
                return;
            }
            await subscribe(props.email);
            props.onSubscriptionChange?.(true);
            message.success(`Subscribed to ${entityLabel} updates.`);
        } catch (error) {
            const action = isSubscribed ? "unsubscribe" : "subscribe";
            message.error(getSubscriptionErrorMessage(error, action, entityLabel));
        }
    };
    return (
        <Button
            icon={isSubscribed ? <BellFilled /> : <BellOutlined />}
            size={size}
            type={type}
            block={props.block}
            disabled={!props.targetID}
            className={getSubscribeButtonClassName(props.className)}
            onClick={handleClick}
            loading={isPending}
        >
            {isSubscribed ? "Unsubscribe" : "Subscribe"}
        </Button>
    );
};
