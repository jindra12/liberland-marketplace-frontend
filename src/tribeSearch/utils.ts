import { z } from "zod";
import { SITE_URL } from "../siteUrl";
import { buildDetailUrl } from "../detailMetadata/related";
import { TRIBE_COLLECTIONS, TRIBE_ENTITIES } from "./constants";
import type { TribeEntity, TribeListing, TribeReference, TribeSearchInput } from "./types";

export const tribeSearchSchema = z.object({
    entity: z.enum(TRIBE_ENTITIES),
    tribe: z.string().min(1).max(100).optional(),
    tribeId: z.string().min(1).max(100).optional(),
    serverUrl: z.url().optional(),
    page: z.coerce.number().int().positive().max(10000).default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
}).refine((input) => Boolean(input.tribe || input.tribeId), {
    message: "Provide tribe (an exact tribe name) or tribeId. Use tribeId to disambiguate names.",
});

export const selectTribe = (tribes: TribeReference[], name: string): TribeReference => {
    const matches = tribes.filter((tribe) => tribe.name.toLocaleLowerCase() === name.toLocaleLowerCase());
    if (matches.length !== 1) {
        throw new Error(matches.length
            ? `Ambiguous tribe name. Repeat with tribeId: ${matches.map((tribe) => `${tribe.name} (${tribe.id})`).join(", ")}`
            : `No tribe named ${name} was found. Browse /tribes to find its exact name or ID.`);
    }
    return matches[0];
};

export const tribeCollectionPath = (entity: TribeEntity, tribeId: string, serverUrl: string, page = 1, limit = 20): string => {
    const query = new URLSearchParams({ tribeId, serverUrl });
    if (page > 1) {
        query.set("page", String(page));
    }
    if (limit !== 20) {
        query.set("limit", String(limit));
    }
    return `${TRIBE_COLLECTIONS[entity].path}?${query}`;
};

export const tribeSearchActions = () => TRIBE_ENTITIES.map((entity) => ({
    "@type": "SearchAction",
    name: `Find ${TRIBE_COLLECTIONS[entity].label.toLowerCase()} by tribe affiliation`,
    description: "Match the exact tribe name. Companies belong to the tribe; products and jobs belong through their company. This does not establish legal incorporation or location.",
    target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/api/search/tribe?entity=${entity}&tribe={tribe}`,
        httpMethod: "GET",
        encodingType: "application/ld+json",
    },
    "query-input": "required name=tribe",
}));

export const buildTribeListingMetadata = (
    input: TribeSearchInput,
    tribe: TribeReference,
    serverUrl: string,
    listing: TribeListing,
) => {
    const collection = TRIBE_COLLECTIONS[input.entity];
    const canonicalPath = tribeCollectionPath(input.entity, tribe.id, serverUrl, input.page, input.limit);
    const title = `${tribe.name}: ${collection.label} - Page ${input.page}`;
    const description = `${collection.label} affiliated with the ${tribe.name} tribe, via each company's primary tribe. Not a claim of legal incorporation or physical location. ${listing.totalDocs} published results on ${serverUrl}.`;
    const extraLinks = [
        ...(input.page > 1 ? [{ rel: "prev", href: tribeCollectionPath(input.entity, tribe.id, serverUrl, input.page - 1, input.limit) }] : []),
        ...(listing.hasNextPage ? [{ rel: "next", href: tribeCollectionPath(input.entity, tribe.id, serverUrl, input.page + 1, input.limit) }] : []),
    ];
    const jsonLd = [{
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${SITE_URL}${canonicalPath}`,
        url: `${SITE_URL}${canonicalPath}`,
        name: title,
        description,
        about: { "@type": "Organization", "@id": buildDetailUrl("/tribes", tribe.id, serverUrl), name: tribe.name },
        relatedLink: TRIBE_ENTITIES.map((entity) => `${SITE_URL}${tribeCollectionPath(entity, tribe.id, serverUrl)}`),
        potentialAction: tribeSearchActions(),
        mainEntity: {
            "@type": "ItemList",
            numberOfItems: listing.totalDocs,
            itemListElement: listing.docs.map((item, index) => ({
                "@type": "ListItem",
                position: (input.page - 1) * input.limit + index + 1,
                item: {
                    "@type": collection.type,
                    "@id": buildDetailUrl(collection.path, item.id, item.serverURL || serverUrl),
                    url: buildDetailUrl(collection.path, item.id, item.serverURL || serverUrl),
                    name: item.name || item.title || collection.label,
                    description: item.description || undefined,
                },
            })),
        },
        // Embed pagination in the graph, not only in HTTP/head links.
        hasPart: extraLinks.map((link) => ({ "@type": "CollectionPage", name: link.rel, url: `${SITE_URL}${link.href}` })),
    }];
    return { title, description, canonicalPath, jsonLd, extraLinks, extraMetaTags: [] };
};
