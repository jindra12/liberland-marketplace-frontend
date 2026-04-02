import { useRef, useCallback } from "react";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { resolveImageId } from "./useImageUpload";

interface UseEntityFormConfig<TValues, TCreate, TUpdate> {
    entityName: string;
    routePrefix: string;
    mode: "create" | "edit";
    existingImageId?: string | null;
    editId?: string | null;
    url: string;
    createMutation: { isPending: boolean; mutateAsync: (vars: { data: never; draft: boolean }) => Promise<TCreate> };
    updateMutation: { isPending: boolean; mutateAsync: (vars: { id: string; data: never; draft: boolean }) => Promise<TUpdate> };
    buildData: (values: TValues, imageId: string | undefined | null) => object;
    getCreateId: (result: TCreate) => string | undefined | null;
    getUpdateId: (result: TUpdate) => string | undefined | null;
}

export const useEntityForm = <TValues extends { imageFile?: unknown }, TCreate, TUpdate>(config: UseEntityFormConfig<TValues, TCreate, TUpdate>) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const draftRef = useRef(false);
    const loading = config.createMutation.isPending || config.updateMutation.isPending;
    const listQueryKey = `List${config.entityName === "Product" ? "Products" : `${config.entityName}s`}`;
    const byIdQueryKey = `${config.entityName}ById`;

    const onFinish = useCallback(
        async (values: TValues) => {
            const imageId = await resolveImageId(config.url, values.imageFile as Parameters<typeof resolveImageId>[1], config.existingImageId);

            const draft = draftRef.current;
            const data = { ...config.buildData(values, imageId), _status: draft ? "draft" : "published" } as never;

            try {
                const label = draft ? "saved as draft" : "published";
                if (config.mode === "edit" && config.editId) {
                    const result = await config.updateMutation.mutateAsync({
                        id: config.editId,
                        data,
                        draft,
                    });
                    await Promise.all([queryClient.invalidateQueries({ queryKey: [listQueryKey] }), queryClient.invalidateQueries({ queryKey: [byIdQueryKey] })]);
                    message.success(`${config.entityName} ${label}!`);
                    navigate(`${config.routePrefix}/${config.getUpdateId(result)}`);
                } else {
                    const result = await config.createMutation.mutateAsync({
                        data,
                        draft,
                    });
                    await queryClient.invalidateQueries({ queryKey: [listQueryKey] });
                    message.success(`${config.entityName} ${label}!`);
                    navigate(`${config.routePrefix}/${config.getCreateId(result)}`);
                }
            } catch (e: unknown) {
                message.error(e instanceof Error ? e.message : "Something went wrong");
            }
        },
        [config, navigate, queryClient, listQueryKey, byIdQueryKey],
    );

    return { form, draftRef, loading, onFinish };
};
