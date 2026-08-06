import { SECTION_LINKS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./constants";

export type SeoConfig = {
    title: string;
    description: string;
    noIndex?: boolean;
    paginate?: boolean;
    keywords?: string[];
    buildJsonLd?: (canonicalPath: string, pageNumber?: number) => Record<string, unknown>[];
};

const buildCollectionDescription = (description: string, actions: string[]): string => {
    return `${description} On this page you can ${actions.join(", ")}.`;
};

const buildWebsiteJsonLd = (canonicalPath: string): Record<string, unknown>[] => {
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;
    return [
        {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}/jobs?search={search_term_string}`,
                "query-input": "required name=search_term_string",
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${SITE_NAME} marketplace home`,
            url: canonicalUrl,
            description: "Home page for a tribe-first marketplace that merges listings from syndicated backend URLs.",
            isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Marketplace sections",
            itemListElement: SECTION_LINKS.map((section, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: section.name,
                url: `${SITE_URL}${section.path}`,
            })),
        },
    ];
};

const buildCollectionJsonLd = (
    name: string,
    path: string,
    description: string,
    keywords: string[] = [],
    searchPath: string = path,
): ((canonicalPath: string, pageNumber?: number) => Record<string, unknown>[]) => {
    return (canonicalPath: string, pageNumber?: number) => [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: pageNumber && pageNumber > 1 ? `${name} | ${SITE_NAME} | Page ${pageNumber}` : `${name} | ${SITE_NAME}`,
            url: `${SITE_URL}${canonicalPath}`,
            description,
            isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
            },
            mainEntity: {
                "@type": "ItemList",
                name,
                url: `${SITE_URL}${path}`,
            },
            keywords: keywords.join(", "),
            potentialAction: {
                "@type": "SearchAction",
                target: `${SITE_URL}${searchPath}?search={search_term_string}`,
                "query-input": "required name=search_term_string",
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name,
                    item: `${SITE_URL}${path}`,
                },
            ],
        },
    ];
};

const buildDetailJsonLd = (
    sectionName: string,
    sectionPath: string,
    detailLabel: string,
    description: string,
): ((canonicalPath: string) => Record<string, unknown>[]) => {
    return (canonicalPath: string) => [
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: `${detailLabel} | ${SITE_NAME}`,
            url: `${SITE_URL}${canonicalPath}`,
            description,
            isPartOf: {
                "@type": "WebSite",
                name: SITE_NAME,
                url: SITE_URL,
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: SITE_URL,
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: sectionName,
                    item: `${SITE_URL}${sectionPath}`,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: detailLabel,
                    item: `${SITE_URL}${canonicalPath}`,
                },
            ],
        },
    ];
};

export const DEFAULT_SEO: SeoConfig = {
    title: "NSwap | Tribe-first marketplace",
    description: SITE_DESCRIPTION,
    buildJsonLd: buildWebsiteJsonLd,
};

export const SEO_BY_ROUTE: Record<string, SeoConfig> = {
    "/": {
        title: "NSwap | Tribe-first marketplace",
        description:
            "Discover companies, jobs, products/services, ventures, posts, tribes, and syndicated sources from a network of marketplace endpoints. Use the sections to browse listings, inspect details, and follow the linked identity or company context.",
        buildJsonLd: buildWebsiteJsonLd,
    },
    "/jobs": {
        title: "Jobs | NSwap",
        description: buildCollectionDescription("Browse published jobs collected from syndicated marketplace backends.", [
            "scan open roles across syndicated endpoints",
            "filter for work that matches your skills",
            "open a job detail page to review the employer and application details",
        ]),
        paginate: true,
        keywords: ["jobs", "open roles", "careers", "hiring", "employment", "marketplace jobs"],
        buildJsonLd: buildCollectionJsonLd("Jobs", "/jobs", "Job listings available through syndicated marketplace endpoints.", [
            "jobs",
            "open roles",
            "careers",
            "employment",
            "hiring",
        ]),
    },
    "/jobs/[id]": {
        title: "Job listing | NSwap",
        description: "View a specific job listing and related company/identity information.",
        buildJsonLd: buildDetailJsonLd(
            "Jobs",
            "/jobs",
            "Job listing detail",
            "Detail page for one published job listing.",
        ),
    },
    "/jobs/edit/[id]": {
        title: "Edit job | NSwap",
        description: "Internal editor for updating a published job listing.",
        noIndex: true,
    },
    "/companies": {
        title: "Companies | NSwap",
        description: buildCollectionDescription("Explore company profiles and their linked marketplace activity.", [
            "review company profiles",
            "open related jobs, products, posts, and ventures",
            "inspect verification and identity links",
        ]),
        paginate: true,
        keywords: ["companies", "company profiles", "organizations", "businesses", "marketplace companies"],
        buildJsonLd: buildCollectionJsonLd("Companies", "/companies", "Company profiles and related listings shared through syndicated sources.", [
            "companies",
            "company profiles",
            "organizations",
            "businesses",
        ]),
    },
    "/companies/[id]": {
        title: "Company profile | NSwap",
        description: "View one company profile with related products/services, jobs, and ventures.",
        buildJsonLd: buildDetailJsonLd(
            "Companies",
            "/companies",
            "Company profile detail",
            "Detail page for a single company profile.",
        ),
    },
    "/companies/edit/[id]": {
        title: "Edit company | NSwap",
        description: "Internal editor for updating company profile data.",
        noIndex: true,
    },
    "/tribes": {
        title: "Tribes | NSwap",
        description: buildCollectionDescription("Browse identities (tribes) and explore their marketplace ecosystem.", [
            "open tribe profiles",
            "follow the companies and listings tied to each identity",
            "compare how different communities participate in the marketplace",
        ]),
        paginate: true,
        keywords: ["tribes", "identities", "communities", "marketplace networks"],
        buildJsonLd: buildCollectionJsonLd("Tribes", "/tribes", "Identity groups and their related marketplace listings.", [
            "tribes",
            "identities",
            "communities",
            "network profiles",
        ]),
    },
    "/tribes/[id]": {
        title: "Tribe profile | NSwap",
        description: "View a tribe profile and associated companies, jobs, products/services, and ventures.",
        buildJsonLd: buildDetailJsonLd(
            "Tribes",
            "/tribes",
            "Tribe profile detail",
            "Detail page for one tribe/identity.",
        ),
    },
    "/products-services": {
        title: "Products and services | NSwap",
        description: buildCollectionDescription("Discover orderable products and services published across syndicated endpoints.", [
            "compare offers, prices, and inventory",
            "open product detail pages for more specifications",
            "jump to the seller's company profile",
        ]),
        paginate: true,
        keywords: ["products", "services", "product listings", "services listings", "inventory", "prices", "marketplace products"],
        buildJsonLd: buildCollectionJsonLd(
            "Products and services",
            "/products-services",
            "Orderable products and services from syndicated marketplace sources.",
            ["products", "services", "orderable items", "inventory", "prices"],
        ),
    },
    "/products-services/[id]": {
        title: "Product or service detail | NSwap",
        description: "View a specific product/service listing with pricing and availability details.",
        buildJsonLd: buildDetailJsonLd(
            "Products and services",
            "/products-services",
            "Product or service detail",
            "Detail page for one product/service listing.",
        ),
    },
    "/products-services/edit/[id]": {
        title: "Edit product or service | NSwap",
        description: "Internal editor for updating a product/service listing.",
        noIndex: true,
    },
    "/posts": {
        title: "Posts | NSwap",
        description: buildCollectionDescription("Browse published posts shared through syndicated marketplace endpoints.", [
            "read marketplace announcements and updates",
            "open post detail pages for the full content",
            "follow the linked company or author context",
        ]),
        paginate: true,
        keywords: ["posts", "announcements", "updates", "marketplace posts", "news"],
        buildJsonLd: buildCollectionJsonLd("Posts", "/posts", "Published posts from syndicated marketplace sources.", [
            "posts",
            "announcements",
            "updates",
            "news",
        ]),
    },
    "/posts/[id]": {
        title: "Post | NSwap",
        description: "View a published post and its related content.",
        buildJsonLd: buildDetailJsonLd("Posts", "/posts", "Post detail", "Detail page for one published post."),
    },
    "/posts/edit/[id]": {
        title: "Edit post | NSwap",
        description: "Internal editor for updating a published post.",
        noIndex: true,
    },
    "/ventures": {
        title: "Ventures | NSwap",
        description: buildCollectionDescription("Explore startup and venture profiles shared through the marketplace network.", [
            "review startup summaries and funding details",
            "open venture detail pages for deeper context",
            "jump to the related identity or company profile",
        ]),
        paginate: true,
        keywords: ["ventures", "startups", "funding", "portfolio", "venture profiles"],
        buildJsonLd: buildCollectionJsonLd(
            "Ventures",
            "/ventures",
            "Startup and venture entries published through syndicated marketplace endpoints.",
            ["ventures", "startups", "funding", "portfolio companies"],
        ),
    },
    "/ventures/[id]": {
        title: "Venture detail | NSwap",
        description: "View one venture/startup profile and supporting information.",
        buildJsonLd: buildDetailJsonLd(
            "Ventures",
            "/ventures",
            "Venture detail",
            "Detail page for one venture/startup.",
        ),
    },
    "/ventures/edit/[id]": {
        title: "Edit venture | NSwap",
        description: "Internal editor for updating venture details.",
        noIndex: true,
    },
    "/syndication": {
        title: "Syndication | NSwap",
        description: buildCollectionDescription(
            "Manage syndicated marketplace URLs, add new endpoints, and control which ones are enabled locally.",
            [
                "review each syndicated backend endpoint",
                "check names, descriptions, and NSFW status before enabling a URL",
                "add or disable sources that feed the marketplace",
            ],
        ),
        paginate: true,
        keywords: ["syndication", "marketplace urls", "sources", "endpoints"],
        buildJsonLd: buildCollectionJsonLd(
            "Syndication",
            "/syndication",
            "Locally managed syndicated marketplace URLs.",
        ),
    },
    "/syndicate": {
        title: "Syndicate | NSwap",
        description: "A friendly guided tour for new users who want to learn how to set up and browse the network.",
        noIndex: true,
    },
    "/syndication/[id]": {
        title: "Syndicated URL detail | NSwap",
        description: "Review one syndicated marketplace URL and control whether it is enabled locally.",
        buildJsonLd: buildDetailJsonLd(
            "Syndication",
            "/syndication",
            "Syndicated URL detail",
            "Detail page for one syndicated marketplace URL.",
        ),
    },
    "/publish": {
        title: "Publish | NSwap",
        description: "Create marketplace content on a selected backend endpoint.",
        noIndex: true,
    },
    "/profile": {
        title: "Profile | NSwap",
        description: "User profile and account management page.",
        noIndex: true,
    },
    "/cart": {
        title: "Cart | NSwap",
        description: "Review selected products/services before submitting an order.",
        noIndex: true,
    },
    "/order": {
        title: "Order and payment | NSwap",
        description: "Submit order details and complete chain-specific payment steps.",
        noIndex: true,
    },
    "/unsubscribe": {
        title: "Unsubscribe | NSwap",
        description: "Manage email notification preferences for marketplace subscription updates.",
        noIndex: true,
    },
    "/auth/callback": {
        title: "Authentication callback | NSwap",
        description: "Authentication callback endpoint.",
        noIndex: true,
    },
};
