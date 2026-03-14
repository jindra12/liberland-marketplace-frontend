import * as React from "react";
import { useRouter } from "next/router";
import { Dynamic } from "./Dynamic";
import { AppHead } from "./AppHead";

type SeoConfig = {
    title: string;
    description: string;
    noIndex?: boolean;
    buildJsonLd?: (canonicalPath: string) => Record<string, unknown>[];
};

const SITE_NAME = "NSwap";
const SITE_URL = "https://nswap.io";
const SITE_DESCRIPTION = "Tribe-first network marketplace frontend that aggregates listings from syndicated backend endpoints.";

const SECTION_LINKS: Array<{ name: string; path: string; description: string }> = [
    { name: "Jobs", path: "/jobs", description: "Browse published jobs across syndicated endpoints." },
    { name: "Products and Services", path: "/products-services", description: "Discover orderable products and services from participating companies." },
    { name: "Companies", path: "/companies", description: "Review company profiles and their related market activity." },
    { name: "Ventures", path: "/ventures", description: "Explore startup and venture listings shared by communities and companies." },
    { name: "Tribes", path: "/tribes", description: "Explore identity groups and their associated marketplaces." },
    { name: "Syndication", path: "/syndication", description: "Manage syndicated marketplace URLs available to your frontend." },
];

const normalizePath = (path: string): string => {
    if (!path) {
        return "/";
    }

    const withoutQuery = path.split("?")[0].split("#")[0] || "/";
    return withoutQuery.startsWith("/") ? withoutQuery : `/${withoutQuery}`;
};

const ROUTE_PATTERN_REGEX = /\[[^/]+]/;

const isRoutePattern = (path: string): boolean => ROUTE_PATTERN_REGEX.test(path);

const toEncodedPathValue = (value: string | string[]): string => {
    if (Array.isArray(value)) {
        return value.map((segment) => encodeURIComponent(segment)).join("/");
    }
    return encodeURIComponent(value);
};

const resolvePathnameWithQuery = (
    pathname: string,
    query: Record<string, string | string[] | undefined>,
): string => {
    let resolved = pathname;

    Object.entries(query).forEach(([key, value]) => {
        if (!value) {
            return;
        }

        const encoded = toEncodedPathValue(value);
        resolved = resolved
            .replace(new RegExp(`\\[\\[\\.\\.\\.${key}\\]\\]`, "g"), encoded)
            .replace(new RegExp(`\\[\\.\\.\\.${key}\\]`, "g"), encoded)
            .replace(new RegExp(`\\[${key}\\]`, "g"), encoded);
    });

    return resolved;
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
): ((canonicalPath: string) => Record<string, unknown>[]) => {
    return (canonicalPath: string) => [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${name} | ${SITE_NAME}`,
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

const DEFAULT_SEO: SeoConfig = {
    title: "NSwap | Tribe-first marketplace",
    description: SITE_DESCRIPTION,
    buildJsonLd: buildWebsiteJsonLd,
};

const SEO_BY_ROUTE: Record<string, SeoConfig> = {
    "/": {
        title: "NSwap | Tribe-first marketplace",
        description: "Discover companies, jobs, products/services, and ventures from a network of syndicated marketplace endpoints.",
        buildJsonLd: buildWebsiteJsonLd,
    },
    "/jobs": {
        title: "Jobs | NSwap",
        description: "Browse published jobs collected from syndicated marketplace backends.",
        buildJsonLd: buildCollectionJsonLd("Jobs", "/jobs", "Job listings available through syndicated marketplace endpoints."),
    },
    "/jobs/[id]": {
        title: "Job listing | NSwap",
        description: "View a specific job listing and related company/identity information.",
        buildJsonLd: buildDetailJsonLd("Jobs", "/jobs", "Job listing detail", "Detail page for one published job listing."),
    },
    "/jobs/edit/[id]": {
        title: "Edit job | NSwap",
        description: "Internal editor for updating a published job listing.",
        noIndex: true,
    },
    "/companies": {
        title: "Companies | NSwap",
        description: "Explore company profiles and their linked marketplace activity.",
        buildJsonLd: buildCollectionJsonLd("Companies", "/companies", "Company profiles and related listings shared through syndicated sources."),
    },
    "/companies/[id]": {
        title: "Company profile | NSwap",
        description: "View one company profile with related products/services, jobs, and ventures.",
        buildJsonLd: buildDetailJsonLd("Companies", "/companies", "Company profile detail", "Detail page for a single company profile."),
    },
    "/companies/edit/[id]": {
        title: "Edit company | NSwap",
        description: "Internal editor for updating company profile data.",
        noIndex: true,
    },
    "/tribes": {
        title: "Tribes | NSwap",
        description: "Browse identities (tribes) and explore their marketplace ecosystem.",
        buildJsonLd: buildCollectionJsonLd("Tribes", "/tribes", "Identity groups and their related marketplace listings."),
    },
    "/tribes/[id]": {
        title: "Tribe profile | NSwap",
        description: "View a tribe profile and associated companies, jobs, products/services, and ventures.",
        buildJsonLd: buildDetailJsonLd("Tribes", "/tribes", "Tribe profile detail", "Detail page for one tribe/identity."),
    },
    "/products-services": {
        title: "Products and services | NSwap",
        description: "Discover orderable products and services published across syndicated endpoints.",
        buildJsonLd: buildCollectionJsonLd("Products and services", "/products-services", "Orderable products and services from syndicated marketplace sources."),
    },
    "/products-services/[id]": {
        title: "Product or service detail | NSwap",
        description: "View a specific product/service listing with pricing and availability details.",
        buildJsonLd: buildDetailJsonLd("Products and services", "/products-services", "Product or service detail", "Detail page for one product/service listing."),
    },
    "/products-services/edit/[id]": {
        title: "Edit product or service | NSwap",
        description: "Internal editor for updating a product/service listing.",
        noIndex: true,
    },
    "/ventures": {
        title: "Ventures | NSwap",
        description: "Explore startup and venture profiles shared through the marketplace network.",
        buildJsonLd: buildCollectionJsonLd("Ventures", "/ventures", "Startup and venture entries published through syndicated marketplace endpoints."),
    },
    "/ventures/[id]": {
        title: "Venture detail | NSwap",
        description: "View one venture/startup profile and supporting information.",
        buildJsonLd: buildDetailJsonLd("Ventures", "/ventures", "Venture detail", "Detail page for one venture/startup."),
    },
    "/ventures/edit/[id]": {
        title: "Edit venture | NSwap",
        description: "Internal editor for updating venture details.",
        noIndex: true,
    },
    "/syndication": {
        title: "Syndication | NSwap",
        description: "Manage syndicated marketplace URLs, add new endpoints, and control which ones are enabled locally.",
        buildJsonLd: buildCollectionJsonLd("Syndication", "/syndication", "Locally managed syndicated marketplace URLs."),
    },
    "/syndication/[id]": {
        title: "Syndicated URL detail | NSwap",
        description: "Review one syndicated marketplace URL and control whether it is enabled locally.",
        buildJsonLd: buildDetailJsonLd("Syndication", "/syndication", "Syndicated URL detail", "Detail page for one syndicated marketplace URL."),
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
    "/auth/callback": {
        title: "Authentication callback | NSwap",
        description: "Authentication callback endpoint.",
        noIndex: true,
    },
};

const ShellPage: React.FunctionComponent = () => {
    const router = useRouter();
    const seo = SEO_BY_ROUTE[router.pathname] || DEFAULT_SEO;
    const [browserCanonicalPath, setBrowserCanonicalPath] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
        if (typeof window === "undefined") {
            return;
        }

        setBrowserCanonicalPath(normalizePath(window.location.pathname));
    }, [router.asPath]);

    const serverResolvedPath = normalizePath(
        resolvePathnameWithQuery(
            router.pathname || "/",
            router.query as Record<string, string | string[] | undefined>,
        ),
    );
    const asPath = normalizePath(router.asPath || "");

    const canonicalPath = React.useMemo(() => {
        if (browserCanonicalPath) {
            return browserCanonicalPath;
        }

        if (asPath && !isRoutePattern(asPath)) {
            return asPath;
        }

        if (serverResolvedPath && !isRoutePattern(serverResolvedPath)) {
            return serverResolvedPath;
        }

        return undefined;
    }, [asPath, browserCanonicalPath, serverResolvedPath]);

    return (
        <>
            <AppHead
                title={seo.title}
                description={seo.description}
                canonicalPath={canonicalPath}
                noIndex={seo.noIndex}
                siteUrl={SITE_URL}
                jsonLd={canonicalPath ? seo.buildJsonLd?.(canonicalPath) : undefined}
            />
            <Dynamic />
        </>
    );
};

export default ShellPage;
