import type { useEntityForm } from "../../../src/components/publish/useEntityForm";
import type { UploadFile } from "antd/es/upload/interface";

export interface PublishValues {
    name: string;
    imageFile?: UploadFile[];
}

export interface PublishedEntity {
    id: string;
}

export type EntityFormTestConfig = Parameters<typeof useEntityForm<PublishValues, PublishedEntity, PublishedEntity>>[0];
