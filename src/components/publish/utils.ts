import { URL } from "../../types";

import { getSyndicationName } from "../endpoints/utils";

export const sortPublishableUrls = (urls: URL[]): URL[] => {
    return [...urls].sort((left, right) => {
        if (left.name === "Main" && right.name !== "Main") {
            return -1;
        }
        if (right.name === "Main" && left.name !== "Main") {
            return 1;
        }
        if (left.enabled !== right.enabled) {
            return left.enabled ? -1 : 1;
        }
        return getSyndicationName(left).localeCompare(getSyndicationName(right), "en", {
            sensitivity: "base",
        });
    });
};

export const getPublishableUrls = (urls: URL[]): URL[] => {
    return sortPublishableUrls(urls.filter((url) => url.enabled));
};
