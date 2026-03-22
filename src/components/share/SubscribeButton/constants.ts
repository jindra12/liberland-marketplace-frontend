import type { NotificationTargetCollection } from "./types";

export const ENTITY_LABELS: Record<NotificationTargetCollection, string> = {
    companies: "company",
    identities: "tribe",
    jobs: "job",
    products: "product",
    startups: "venture",
};

export const SUBSCRIPTION_QUERY_KEY_TERMS: Record<NotificationTargetCollection, string[]> = {
    companies: ["company", "companies"],
    identities: ["identity", "identities"],
    jobs: ["job", "jobs"],
    products: ["product", "products"],
    startups: ["startup", "startups"],
};
