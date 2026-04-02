import { Job_EmploymentType } from "../../../generated/graphql";

export const JOB_TIME_INTERVALS: ReadonlyArray<readonly [number, string]> = [
    [31536000, "year"],
    [2592000, "month"],
    [604800, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
];

export const EMPLOYMENT_TYPE_LABELS: Record<Job_EmploymentType, string> = {
    [Job_EmploymentType.FullTime]: "Full-time",
    [Job_EmploymentType.PartTime]: "Part-time",
    [Job_EmploymentType.Contract]: "Contract",
    [Job_EmploymentType.Internship]: "Internship",
    [Job_EmploymentType.Gig]: "Gig",
};
