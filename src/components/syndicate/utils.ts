import type { URL as EndpointURL } from "../../types";

export type SyndicateDownloadTarget = {
    label: string;
    href: string;
};

export const buildDeploySpaceDownloadUrl = (serverURL: string) => `${serverURL}/deploy-space`;

export const getEnabledSyndicationDownloadTargets = (urls: EndpointURL[]): SyndicateDownloadTarget[] =>
    urls
        .filter((url) => url.enabled)
        .map((url) => ({
            label: url.name || new globalThis.URL(url.value).host,
            href: buildDeploySpaceDownloadUrl(url.value),
        }));
