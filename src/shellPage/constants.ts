import { SITE_URL } from "../siteUrl";

export const SITE_NAME = "NSwap";
export { SITE_URL };
export const SITE_DESCRIPTION =
    "Tribe-first network marketplace frontend that aggregates listings from syndicated backend endpoints.";

export const SECTION_LINKS: Array<{ name: string; path: string; description: string }> = [
    { name: "Jobs", path: "/jobs", description: "Browse published jobs across syndicated endpoints." },
    {
        name: "Products and Services",
        path: "/products-services",
        description: "Discover orderable products and services from participating companies.",
    },
    {
        name: "Companies",
        path: "/companies",
        description: "Review company profiles and their related market activity.",
    },
    {
        name: "Ventures",
        path: "/ventures",
        description: "Explore startup and venture listings shared by communities and companies.",
    },
    { name: "Tribes", path: "/tribes", description: "Explore identity groups and their associated marketplaces." },
    {
        name: "Syndication",
        path: "/syndication",
        description: "Manage syndicated marketplace URLs available to your frontend.",
    },
];
