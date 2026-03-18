import * as React from "react";
import { BellFilled, BellOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import { useSubscriptionActions } from "./useSubscriptionActions";
import {
    getSubscribeButtonClassName,
    getSubscriptionErrorMessage,
} from "./utils";
import type { SubscribeAuthButtonProps } from "./types";

export const SubscribeAuthButton: React.FunctionComponent<SubscribeAuthButtonProps> = ({
    email,
    collection,
    targetID,
    serverURL,
    isSubscribed,
    subscriptionID,
    block,
    className,
    onSubscriptionChange,
    size = "middle",
    type = "default",
}) => {
    const [isSubscribedState, setIsSubscribedState] = React.useState(Boolean(isSubscribed));
    const { entityLabel, isPending, subscribe, unsubscribe } = useSubscriptionActions({
        collection,
        targetID,
        serverURL,
        subscriptionID,
    });

    React.useEffect(() => {
        setIsSubscribedState(Boolean(isSubscribed));
    }, [collection, isSubscribed, serverURL, subscriptionID, targetID]);

    const handleClick = async (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        event.stopPropagation();

        try {
            if (isSubscribedState) {
                await unsubscribe(email);
                setIsSubscribedState(false);
                onSubscriptionChange?.(false);
                message.success(`Unsubscribed from ${entityLabel} updates.`);
                return;
            }

            await subscribe(email);
            setIsSubscribedState(true);
            onSubscriptionChange?.(true);
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
            block={block}
            disabled={!targetID}
            className={getSubscribeButtonClassName(className)}
            onClick={handleClick}
            loading={isPending}
        >
            {isSubscribedState ? "Unsubscribe" : "Subscribe"}
        </Button>
    );
};
