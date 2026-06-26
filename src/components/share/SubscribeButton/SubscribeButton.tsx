import * as React from "react";

import { useLocation } from "react-router-dom";

import { BellFilled, BellOutlined } from "@ant-design/icons";
import { Button, message } from "antd";

import { buildLoginReturnTo } from "../../auth/utils";
import { EndpointAuthAction } from "../../EndpointAuthAction/EndpointAuthAction";

import type { SubscribeButtonProps } from "./types";
import { useSubscriptionActions } from "./useSubscriptionActions";
import { getSubscribeButtonClassName, getSubscriptionErrorMessage } from "./utils";

export const SubscribeButton: React.FunctionComponent<SubscribeButtonProps> = (props) => {
    const location = useLocation();
    const returnTo = buildLoginReturnTo(location.pathname, location.search, location.hash);
    const isSubscribed = Boolean(props.isSubscribed);
    const { entityLabel, isPending, subscribe, unsubscribe } = useSubscriptionActions({
        collection: props.collection,
        targetID: props.targetID,
        serverURL: props.serverURL,
    });

    return (
        <EndpointAuthAction defaultAuthUrl={props.serverURL}>
            {({ runWithAuthOrLogin }) => (
                <Button
                    icon={isSubscribed ? <BellFilled /> : <BellOutlined />}
                    size={props.size || "middle"}
                    type={props.type || "default"}
                    block={props.block}
                    disabled={!props.targetID}
                    className={getSubscribeButtonClassName(props.className)}
                    onClick={async (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        try {
                            await runWithAuthOrLogin(
                                async () => {
                                    if (isSubscribed) {
                                        await unsubscribe();
                                        props.onSubscriptionChange?.(false);
                                        message.success(`Unsubscribed from ${entityLabel} updates.`);
                                        return;
                                    }

                                    await subscribe();
                                    props.onSubscriptionChange?.(true);
                                    message.success(`Subscribed to ${entityLabel} updates.`);
                                },
                                {
                                    signinState: returnTo,
                                },
                            );
                        } catch (error) {
                            const action = isSubscribed ? "unsubscribe" : "subscribe";
                            message.error(getSubscriptionErrorMessage(error, action, entityLabel));
                        }
                    }}
                    loading={isPending}
                >
                    {isSubscribed ? "Unsubscribe" : "Subscribe"}
                </Button>
            )}
        </EndpointAuthAction>
    );
};
