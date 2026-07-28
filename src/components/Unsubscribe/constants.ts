import type { NotificationTargetCollection } from "../share/SubscribeButton/types";

export const NOTIFICATION_TARGET_QUERY_TYPES: Record<NotificationTargetCollection, string> = {
    companies: "Companies",
    identities: "Identities",
    jobs: "Jobs",
    products: "Products",
    startups: "Ventures",
};

export const NOTIFICATION_TARGET_LABELS: Record<NotificationTargetCollection, string> = {
    companies: "Company",
    identities: "Tribe",
    jobs: "Job",
    products: "Product",
    startups: "Venture",
};

export const NOTIFICATION_TARGET_FRONTEND_PATHS: Record<NotificationTargetCollection, string> = {
    companies: "companies",
    identities: "tribes",
    jobs: "jobs",
    products: "products-services",
    startups: "ventures",
};

export const NOTIFICATION_TARGET_QUERY_TYPE_TO_COLLECTION: Record<string, NotificationTargetCollection> = {
    Companies: "companies",
    Identities: "identities",
    Jobs: "jobs",
    Products: "products",
    Ventures: "startups",
};
