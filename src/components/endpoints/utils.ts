import { BACKEND_URL } from "../../gqlFetcher";
import type { SyndicationDoc, URL as EndpointUrl } from "../../types";

export const normalizeSyndicationUrl = (value: string): string => {
    const parsed = new globalThis.URL(value);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("invalid protocol");
    }

    parsed.hash = "";
    parsed.search = "";
    return parsed.toString().replace(/\/+$/, "");
};

const tryNormalizeEndpointUrl = (value?: string | null): string | undefined => {
    if (!value) {
        return undefined;
    }

    try {
        return normalizeSyndicationUrl(value);
    } catch {
        return undefined;
    }
};

export const getSyndicationHost = (value: string): string => {
    return new globalThis.URL(value).host;
};

export const getSyndicationName = (entry: Pick<EndpointUrl, "name" | "value">): string => {
    return entry.name || getSyndicationHost(entry.value);
};

export const createEndpointEntry = (
    value: string,
    options: Partial<Pick<EndpointUrl, "enabled" | "name" | "description" | "nsfw" | "autoEnable">> = {},
): EndpointUrl => {
    const normalizedValue = normalizeSyndicationUrl(value);

    return {
        enabled: options.enabled ?? true,
        value: normalizedValue,
        name: options.name ?? getSyndicationHost(normalizedValue),
        description: options.description,
        nsfw: options.nsfw,
        autoEnable: options.autoEnable,
    };
};

export const insertUniqueEndpoint = (current: EndpointUrl[] | undefined, entry: EndpointUrl): EndpointUrl[] => {
    const entries = current ?? [];

    if (entries.some((existingEntry) => existingEntry.value === entry.value)) {
        throw new Error("duplicate");
    }

    return [...entries, entry];
};

export const getDefaultEndpointUrls = (): EndpointUrl[] => {
    return [
        {
            enabled: true,
            value: BACKEND_URL,
            name: "Main",
        },
    ];
};

export const setEndpointEnabled = (
    current: EndpointUrl[] | undefined,
    value: string,
    nextEnabled: boolean,
): EndpointUrl[] => {
    return (current ?? []).map((entry) => {
        return entry.value === value ? { ...entry, enabled: nextEnabled } : entry;
    });
};

export const disableNsfwEndpoints = (current: EndpointUrl[] | undefined): EndpointUrl[] => {
    return (current ?? []).map((entry) => {
        if (!entry.nsfw) {
            return entry;
        }

        return {
            ...entry,
            enabled: false,
        };
    });
};

export const hasEnabledNsfwEndpoints = (current: EndpointUrl[] | undefined): boolean => {
    return (current ?? []).some((entry) => entry.enabled && Boolean(entry.nsfw));
};

export const enableOrInsertEndpoint = (current: EndpointUrl[] | undefined, value: string): EndpointUrl[] => {
    const entries = current ?? [];

    if (entries.some((entry) => entry.value === value)) {
        return setEndpointEnabled(entries, value, true);
    }

    return insertUniqueEndpoint(entries, createEndpointEntry(value, { enabled: true }));
};

export const mergeSyndicationUrls = (current: EndpointUrl[] | undefined, docs: SyndicationDoc[]): EndpointUrl[] => {
    const entries = current ?? [];
    const discoveredEntries = docs.flatMap((doc) => {
        const normalizedValue = tryNormalizeEndpointUrl(doc.url);

        if (!normalizedValue) {
            return [];
        }

        return [
            createEndpointEntry(normalizedValue, {
                enabled: doc.autoEnable ?? false,
                name: doc.name,
                description: doc.description,
                nsfw: doc.nsfw,
                autoEnable: doc.autoEnable,
            }),
        ];
    });

    return discoveredEntries.reduce<EndpointUrl[]>((mergedEntries, discoveredEntry) => {
        if (!mergedEntries.some((entry) => entry.value === discoveredEntry.value)) {
            return [...mergedEntries, discoveredEntry];
        }

        return mergedEntries.map((entry) => {
            if (entry.value !== discoveredEntry.value) {
                return entry;
            }

            return {
                ...entry,
                name: discoveredEntry.name || entry.name,
                description: discoveredEntry.description ?? entry.description,
                nsfw: discoveredEntry.nsfw ?? entry.nsfw,
                autoEnable: discoveredEntry.autoEnable ?? entry.autoEnable,
            };
        });
    }, entries);
};
