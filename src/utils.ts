import { ResultStatusType } from "antd/es/result";
import { DocType } from "./types";
import { Job_EmploymentType } from "./generated/graphql";

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

const employmentTypeLabels: Record<Job_EmploymentType, string> = {
    [Job_EmploymentType.FullTime]: "Full-time",
    [Job_EmploymentType.PartTime]: "Part-time",
    [Job_EmploymentType.Contract]: "Contract",
    [Job_EmploymentType.Internship]: "Internship",
};

export const formatEmploymentType = (type?: Job_EmploymentType | null): string | null => {
    return type ? employmentTypeLabels[type] ?? null : null;
};

export const LOREM_FALLBACK = "<p><b>Lorem ipsum</b> dolor sit amet, <b>consectetur adipiscing</b> elit. Sed do eiusmod tempor incididunt ut <b>labore et dolore magna</b> aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea <b>commodo consequat</b>.</p><p>Duis aute irure dolor in <b>reprehenderit</b> in voluptate velit esse cillum dolore eu fugiat nulla pariatur. <b>Excepteur sint occaecat</b> cupidatat non proident, sunt in culpa qui officia deserunt <b>mollit anim</b> id est laborum. Sed ut perspiciatis unde omnis iste natus error sit <b>voluptatem accusantium</b> doloremque laudantium.</p><p>Totam rem aperiam, eaque ipsa quae ab illo <b>inventore veritatis</b> et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia <b>voluptas sit aspernatur</b> aut odit aut fugit, sed quia consequuntur <b>magni dolores</b> eos qui ratione voluptatem sequi nesciunt.</p>";

export const getImage = (doc?: DocType) => {
    switch (doc?.__typename) {
        case "Company":
        case "Identity":
        case "Job":
        case "Product":
            return doc?.image?.url;
        default:
            return undefined;
    }
};
