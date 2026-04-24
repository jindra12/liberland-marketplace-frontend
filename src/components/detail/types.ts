import type { ReactNode } from "react";

import type { SubscriptionTarget } from "../share/SubscribeButton/types";

export type CommonDetailSection = {
    key: string;
    label?: ReactNode;
    children: ReactNode;
};

export type CommonDetailProps = {
    className?: string;
    serverURL?: string | null;
    backTo: string;
    backLabel: string;
    header?: ReactNode;
    beforeShare?: ReactNode;
    sections?: CommonDetailSection[];
    shareLabel: string;
    shareTitle: string;
    shareText: string;
    subscriptionTarget?: SubscriptionTarget | null;
    gap?: number;
};
