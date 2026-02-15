import { ResultStatusType } from "antd/es/result";
import { DocType } from "./types";
import { Job_EmploymentType } from "./generated/graphql";
import { BACKEND_URL } from "./gqlFetcher";

export const convertStatusCode = (status?: number): ResultStatusType => {
    if (status === 403 || status === 404 || status === 500) {
        return status;
    }
    return "error";
};

export const getErrorMessage = (status?: number) => {
    switch (status) {
        case 403: return "Forbidden";
        case 404: return "Not Found";
        default: return "Try later";
    }
};

export const timeAgo = (date: string): string => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    const intervals: [number, string][] = [
        [31536000, "year"],
        [2592000, "month"],
        [604800, "week"],
        [86400, "day"],
        [3600, "hour"],
        [60, "minute"],
    ];
    for (const [secs, label] of intervals) {
        const count = Math.floor(seconds / secs);
        if (count >= 1) return `${count} ${label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
};

export const formatSalary = (min?: number | null, max?: number | null, currency?: string | null): string | null => {
    if (min == null && max == null) return null;
    const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
    const cur = currency || "USD";
    if (min != null && max != null) return `${cur} ${fmt(min)} – ${fmt(max)}`;
    if (min != null) return `From ${cur} ${fmt(min)}`;
    return `Up to ${cur} ${fmt(max!)}`;
};

export const formatBounty = (amount?: number | null, currency?: string | null): string | null => {
    if (amount == null) return null;
    const maxFractionDigits = Number.isInteger(amount) ? 0 : 2;
    const fmt = amount.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${currency || "USD"} ${fmt}`;
};

export const formatPositions = (positions?: number | null): string | null => {
    if (!positions || positions === 1) return null;
    const maxFractionDigits = Number.isInteger(positions) ? 0 : 2;
    const value = positions.toLocaleString("en-US", { maximumFractionDigits: maxFractionDigits });
    return `${value} position${positions === 1 ? "" : "s"}`;
};

const employmentTypeLabels: Record<Job_EmploymentType, string> = {
    [Job_EmploymentType.FullTime]: "Full-time",
    [Job_EmploymentType.PartTime]: "Part-time",
    [Job_EmploymentType.Contract]: "Contract",
    [Job_EmploymentType.Internship]: "Internship",
    [Job_EmploymentType.Gig]: "Gig",
};

export const formatEmploymentType = (type?: Job_EmploymentType | null): string | null => {
    return type ? employmentTypeLabels[type] ?? null : null;
};

export const getImage = (doc?: DocType) => {
    switch (doc?.__typename) {
        case "Company":
        case "Identity":
        case "Job":
        case "Product": {
            const url = doc?.image?.url;
            return url ? `${BACKEND_URL}${url}` : undefined;
        }
        default:
            return undefined;
    }
};
