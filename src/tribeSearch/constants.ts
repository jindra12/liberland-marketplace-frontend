export const TRIBE_ENTITIES = ["companies", "products", "jobs"] as const;

export const TRIBE_COLLECTIONS = {
    companies: { path: "/companies", label: "Companies", type: "Organization" },
    products: { path: "/products-services", label: "Products and services", type: "Product" },
    jobs: { path: "/jobs", label: "Jobs", type: "JobPosting" },
};
