import { encodeServerUrlSegment } from "../routes";

import { SITE_URL } from "./shared";

export type RelatedRouteItem = {
    label: string;
    url: string;
};

export const buildDetailUrl = (sectionPath: string, id: string, serverUrl?: string | null): string => {
    return `${SITE_URL}${sectionPath}/${id}/${encodeServerUrlSegment(serverUrl ?? "")}`;
};

export const buildItemListJsonLd = (name: string, items: RelatedRouteItem[]): Record<string, unknown>[] => {
    if (items.length === 0) {
        return [];
    }

    return [
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name,
            itemListElement: items.map((item, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: item.label,
                url: item.url,
            })),
        },
    ];
};
