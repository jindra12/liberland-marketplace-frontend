import type { UploadFile } from "antd/es/upload/interface";

import type { RelatedTargetSelection } from "../../shared/post/types";

export type PostFormValues = {
    title: string | null;
    content?: string | null;
    seoDescription?: string | null;
    company?: string | null;
    relatedTarget?: RelatedTargetSelection | null;
    imageFile?: UploadFile[];
};

export type PostFormInitialValues = Partial<PostFormValues> & {
    id?: string | null;
    existingImageUrl?: string | null;
    existingImageId?: string | null;
};
