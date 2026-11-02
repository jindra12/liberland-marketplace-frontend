export type PublicPageContent = {
    title: string;
    description: string;
    items: Array<{
        name: string;
        description: string;
        url: string;
        affiliation?: { name: string; url: string };
        website?: string;
        services?: Array<{ name: string; description: string; url: string }>;
    }>;
    links: Array<{ name: string; url: string }>;
};
