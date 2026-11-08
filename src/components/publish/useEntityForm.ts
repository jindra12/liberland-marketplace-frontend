import { useRef } from "react";
import { Form, message } from "antd";
import type { UploadFile } from "antd/es/upload/interface";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveImageId } from "./useImageUpload";
import { encodeServerUrlSegment } from "../../routes";
import { invalidatePublishedEntityQueries } from "./utils";

interface UseEntityFormConfig<TValues, TCreate, TUpdate, TCreateData, TUpdateData> {
    entityName: string;
    routePrefix: string;
    mode: "create" | "edit";
    existingImageId?: string | null;
    editId?: string | null;
    url: string;
    createMutation: {
        isPending: boolean;
        mutateAsync: (vars: { data: TCreateData; draft: boolean; url: string }) => Promise<TCreate>;
    };
    updateMutation: {
        isPending: boolean;
        mutateAsync: (vars: { id: string; data: TUpdateData; draft: boolean; url: string }) => Promise<TUpdate>;
    };
    buildData: (values: TValues, imageId: string | undefined | null) => object;
    getCreateId: (result: TCreate) => string | undefined | null;
    getUpdateId: (result: TUpdate) => string | undefined | null;
}

export const useEntityForm = <
    TValues extends { imageFile?: UploadFile[] }, TCreate, TUpdate,
    TCreateData extends object = object, TUpdateData extends object = object,
>(config: UseEntityFormConfig<TValues, TCreate, TUpdate, TCreateData, TUpdateData>) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form] = Form.useForm<TValues>();
    const draftRef = useRef(false);
    const submitting = useRef(false);
    const submission = useMutation({
        mutationFn: async (input: { values: TValues; draft: boolean }) => {
            const imageId = await resolveImageId(config.url, input.values.imageFile, config.existingImageId);
            const data = { ...config.buildData(input.values, imageId), _status: input.draft ? "draft" : "published" };
            const variables = { draft: input.draft, url: config.url };
            // Generated create/update enums have distinct types but identical wire values.
            const id = config.mode === "edit" && config.editId
                ? config.getUpdateId(await config.updateMutation.mutateAsync({ ...variables, id: config.editId, data: data as TUpdateData }))
                : config.getCreateId(await config.createMutation.mutateAsync({ ...variables, data: data as TCreateData }));

            await invalidatePublishedEntityQueries(queryClient, config.entityName, config.url);
            message.success(`${config.entityName} ${input.draft ? "saved as draft" : "published"}!`);
            form.resetFields();
            navigate(`${config.routePrefix}/${id}/${encodeServerUrlSegment(config.url)}`);
        },
    });

    const onFinish = async (values: TValues) => {
        if (submitting.current) {
            return;
        }

        submitting.current = true;
        try {
            await submission.mutateAsync({ values, draft: draftRef.current });
        } catch (error) {
            console.error(error);
            message.error(error instanceof Error ? error.message : "Something went wrong");
        } finally {
            submitting.current = false;
        }
    };

    return {
        form,
        draftRef,
        loading: submission.isPending || config.createMutation.isPending || config.updateMutation.isPending,
        onFinish,
    };
};
