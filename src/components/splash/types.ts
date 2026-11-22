import type { ReactNode } from "react";

export interface MarketSection {
    key: string;
    title: string;
    route: string;
    body: ReactNode;
}
