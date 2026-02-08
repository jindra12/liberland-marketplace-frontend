import { Company, Identity, Job, Product } from "./generated/graphql";

export type SearchScope = "jobs" | "companies" | "identities" | "products";
export type SearchOption = { value: string; label?: React.ReactNode, image?: string | null };
export type DocType = Partial<Identity| Company | Job | Product>;