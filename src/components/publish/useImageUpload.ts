import type { UploadFile } from "antd/es/upload/interface";
import { uploadMedia } from "../../mediaApi";

/**
 * Resolves a fileList from the ImageUploadField into a media ID for the mutation.
 *
 * Returns:
 * - string (media ID) if a new file was uploaded
 * - undefined if the existing image is unchanged
 * - null if the image was removed
 */
export const resolveImageId = async (url: string, fileList: UploadFile[] | undefined, existingImageId?: string | null): Promise<string | undefined | null> => {
    if (!fileList || fileList.length === 0) {
        return existingImageId ? null : undefined;
    }

    const file = fileList[0];

    // Existing image placeholder (uid "-1") — no change
    if (file.uid === "-1") {
        return undefined;
    }

    // New file selected — upload it
    const doc = await uploadMedia(url, file.originFileObj as File);
    return doc.id;
};
