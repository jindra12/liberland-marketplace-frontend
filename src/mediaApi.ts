import axios from "axios";
import { BACKEND_URL, getAccessToken } from "./gqlFetcher";

interface MediaDoc {
    id: string;
    url: string;
    alt?: string;
    filename: string;
    width?: number;
    height?: number;
    mimeType: string;
}

export const uploadMedia = async (file: File, alt?: string): Promise<MediaDoc> => {
    const token = getAccessToken();
    const formData = new FormData();
    formData.append("file", file);
    if (alt) formData.append("alt", alt);

    const res = await axios.post<{ doc: MediaDoc }>(`${BACKEND_URL}/api/media`, formData, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    return res.data.doc;
};
