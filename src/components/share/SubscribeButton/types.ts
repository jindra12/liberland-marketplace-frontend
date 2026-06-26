import type { ButtonProps } from "antd";

export type NotificationTargetCollection = "companies" | "identities" | "jobs" | "products" | "startups";

export type SubscriptionTarget = {
    collection: NotificationTargetCollection;
    targetID: string;
    serverURL?: string | null;
    isSubscribed?: boolean | null;
};

export type SubscribeButtonProps = SubscriptionTarget & {
    block?: boolean;
    className?: string;
    onSubscriptionChange?: (isSubscribed: boolean) => void;
    size?: ButtonProps["size"];
    type?: ButtonProps["type"];
};

export type SubscriptionAction = "subscribe" | "unsubscribe";
