export type BackendSitemapManifest = {
    version: 1;
    generatedAt: string;
    serverUrl: string;
    frontendUrl: string;
    syndicatedServers: string[];
    shards: Array<{ file: string; lastmod: string; count: number }>;
};
