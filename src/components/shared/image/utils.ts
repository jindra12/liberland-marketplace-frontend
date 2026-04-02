import type { ImageDoc } from "../../../types";

export const getImage = (doc?: ImageDoc): string => {
    if (!doc?.image?.url || !doc.serverURL) {
        return "";
    }

    return new URL(doc.image.url, doc.serverURL).toString();
};
