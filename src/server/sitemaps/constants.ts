export const SITEMAP_SECTIONS = ["/", "/jobs", "/companies", "/products-services", "/posts", "/tribes", "/ventures", "/syndication"];
export const SITEMAP_COLLECTION_PATHS = {
    identities: "/tribes", companies: "/companies", products: "/products-services", jobs: "/jobs",
    startups: "/ventures", posts: "/posts", comments: "/comments", syndications: "/syndication",
} as const;
export const SITEMAP_FILE_PATTERN = /^(identities|companies|products|jobs|startups|posts|comments|syndications)-[a-f0-9]{64}\.xml$/;
export const MAX_SITEMAP_SHARDS = 10000;
export const MAX_SITEMAP_INDEX_ENTRIES = 50000;
export const MAX_SITEMAP_SHARD_URLS = 500;
