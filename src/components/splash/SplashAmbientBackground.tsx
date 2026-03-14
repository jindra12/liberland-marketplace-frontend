import * as React from "react";

import { BACKEND_URL } from "../../gqlFetcher";
import { useEntityImageUrlsQuery } from "../hooks";

type BackgroundItemKind = "company" | "job" | "startup" | "identity";

type BackgroundItem = {
    kind: BackgroundItemKind;
    url: string;
};

const BACKGROUND_IMAGE_COUNT = 50;

const normalizeImageUrl = (value?: string | null): string | null => {
    if (!value) {
        return null;
    }

    try {
        return new URL(value, BACKEND_URL).toString();
    } catch {
        return null;
    }
};

export const SplashAmbientBackground: React.FunctionComponent = () => {
    const query = useEntityImageUrlsQuery();

    const items = React.useMemo(() => {
        if (!query.data) {
            return [];
        }

        const groups: Array<{ kind: BackgroundItemKind; urls: string[] }> = [
            {
                kind: "company",
                urls: (query.data.companies?.docs ?? [])
                    .map((doc) => normalizeImageUrl(doc.image?.url))
                    .filter((url): url is string => Boolean(url)),
            },
            {
                kind: "job",
                urls: (query.data.jobs?.docs ?? [])
                    .map((doc) => normalizeImageUrl(doc.image?.url))
                    .filter((url): url is string => Boolean(url)),
            },
            {
                kind: "startup",
                urls: (query.data.startups?.docs ?? [])
                    .map((doc) => normalizeImageUrl(doc.image?.url))
                    .filter((url): url is string => Boolean(url)),
            },
            {
                kind: "identity",
                urls: (query.data.identities?.docs ?? [])
                    .map((doc) => normalizeImageUrl(doc.image?.url))
                    .filter((url): url is string => Boolean(url)),
            },
        ];

        const maxLength = Math.max(0, ...groups.map((group) => group.urls.length));

        const baseItems: BackgroundItem[] = Array.from({ length: maxLength })
            .flatMap((_, index) =>
                groups.flatMap((group) => {
                    const url = group.urls[index];

                    return url ? [{ kind: group.kind, url }] : [];
                })
            );

        if (!baseItems.length) {
            return [];
        }

        return Array.from({ length: BACKGROUND_IMAGE_COUNT }, (_, index) => {
            return baseItems[index % baseItems.length]!;
        });
    }, [query.data]);

    return (
        <div className="SplashAmbientBackground" aria-hidden="true">
            <div className="SplashAmbientBackground__glow SplashAmbientBackground__glow--left" />
            <div className="SplashAmbientBackground__glow SplashAmbientBackground__glow--right" />
            <div className="SplashAmbientBackground__glow SplashAmbientBackground__glow--center" />

            <div className="SplashAmbientBackground__grid">
                {items.map((item, index) => (
                    <div
                        key={`${item.kind}-${item.url}-${index}`}
                        className={`SplashAmbientBackground__item SplashAmbientBackground__item--${item.kind}`}
                    >
                        <img
                            src={item.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            fetchPriority="low"
                            className="SplashAmbientBackground__image"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
