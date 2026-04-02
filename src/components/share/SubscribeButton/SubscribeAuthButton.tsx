import * as React from "react";
import { BellFilled, BellOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { getSubscribeButtonClassName, getSubscriptionErrorMessage } from "./utils";
import type { SubscribeAuthButtonProps } from "./types";
export const SubscribeAuthButton: React.FunctionComponent<SubscribeAuthButtonProps> = (props) => {
    const size = props.size === undefined ? "middle" : props.size;
    const type = props.type === undefined ? "default" : props.type;
    const [isSubscribedState, setIsSubscribedState] = React.useState(Boolean(props.isSubscribed));
    const { entityLabel, isPending, subscribe, unsubscribe } = useSubscriptionActions({
        collection: props.collection,
        targetID: props.targetID,
        serverURL: props.serverURL,
        subscriptionID: props.subscriptionID,
    });
    React.useEffect(() => {
        setIsSubscribedState(Boolean(props.isSubscribed));
    }, [props.collection, props.isSubscribed, props.serverURL, props.subscriptionID, props.targetID]);
    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();
        try {
            if (isSubscribedState) {
                await unsubscribe(props.email);
                setIsSubscribedState(false);
                props.onSubscriptionChange?.(false);
                message.success(`Unsubscribed from ${entityLabel} updates.`);
                return;
            }
            await subscribe(props.email);
            setIsSubscribedState(true);
            props.onSubscriptionChange?.(true);
            message.success(`Subscribed to ${entityLabel} updates.`);
        } catch (error) {
            const action = isSubscribedState ? "unsubscribe" : "subscribe";
            message.error(getSubscriptionErrorMessage(error, action, entityLabel));
        }
    };
    return (
        <Button
            icon={isSubscribedState ? <BellFilled /> : <BellOutlined />}
            size={size}
            type={type}
            block={props.block}
            disabled={!props.targetID}
            className={getSubscribeButtonClassName(props.className)}
            onClick={handleClick}
            loading={isPending}
        >
            {isSubscribedState ? "Unsubscribe" : "Subscribe"}
        </Button>
    );
};
