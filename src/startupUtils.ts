import type { QueryClient } from "@tanstack/react-query";
import { Startup_Stage } from "./generated/graphql";

const stageLabels: Record<string, string> = {
    idea: "Idea",
    early: "Early",
    mvp: "MVP",
    established: "Established",
    scaling: "Scaling",
};

const resourceLabels: Record<string, string> = {
    funding: "Funding",
    founders: "Founders",
    team: "Team",
    traction: "Traction",
    distribution: "Distribution",
    production: "Production",
    idea: "Idea",
    product: "Product",
};

export const formatStageLabel = (stage?: Startup_Stage | string | null): string =>
    stage ? (stageLabels[stage] ?? stage) : "Unknown";

export const formatResourceLabel = (resource?: string | null): string =>
    resource ? (resourceLabels[resource] ?? resource) : "";

export const formatFundsNeeded = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const cur = currency || "USD";
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
    return `${cur} ${fmt}`;
};

export const invalidateStartupQueries = async (queryClient: QueryClient) => {
    await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["StartupById"] }),
        queryClient.invalidateQueries({ queryKey: ["ListStartups"] }),
        queryClient.invalidateQueries({ queryKey: ["ListStartupsByCompany"] }),
        queryClient.invalidateQueries({ queryKey: ["ListStartupsByCreator"] }),
        queryClient.invalidateQueries({ queryKey: ["ListStartupsByIdentity"] }),
        queryClient.invalidateQueries({ queryKey: ["SearchStartups"] }),
    ]);
};
