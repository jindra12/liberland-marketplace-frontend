import { useRef, useCallback } from "react";
import { Form, message } from "antd";
import { useNavigate } from "react-router-dom";
import { resolveImageId } from "./useImageUpload";

interface UseEntityFormConfig<TValues, TCreate, TUpdate> {
    entityName: string;
    routePrefix: string;
    mode: "create" | "edit";
    existingImageId?: string;
    editId?: string;
    createMutation: { isPending: boolean; mutateAsync: (vars: { data: never; draft: boolean }) => Promise<TCreate> };
    updateMutation: { isPending: boolean; mutateAsync: (vars: { id: string; data: never; draft: boolean }) => Promise<TUpdate> };
    buildData: (values: TValues, imageId: string | undefined | null) => Record<string, unknown>;
    getCreateId: (result: TCreate) => string | undefined | null;
    getUpdateId: (result: TUpdate) => string | undefined | null;
}

export const useEntityForm = <TValues extends { imageFile?: unknown }, TCreate, TUpdate>(
    config: UseEntityFormConfig<TValues, TCreate, TUpdate>,
) => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const draftRef = useRef(false);
    const loading = config.createMutation.isPending || config.updateMutation.isPending;

    const onFinish = useCallback(async (values: TValues) => {
        const imageId = await resolveImageId(
            values.imageFile as Parameters<typeof resolveImageId>[0],
            config.existingImageId,
        );

        const data = config.buildData(values, imageId);
        const draft = draftRef.current;
        data._status = draft ? "draft" : "published";

        try {
            const label = draft ? "saved as draft" : "published";
            if (config.mode === "edit" && config.editId) {
                const result = await config.updateMutation.mutateAsync({
                    id: config.editId,
                    data: data as never,
                    draft,
                });
                message.success(`${config.entityName} ${label}!`);
                navigate(`${config.routePrefix}/${config.getUpdateId(result)}`);
            } else {
                const result = await config.createMutation.mutateAsync({
                    data: data as never,
                    draft,
                });
                message.success(`${config.entityName} ${label}!`);
                navigate(`${config.routePrefix}/${config.getCreateId(result)}`);
            }
        } catch (e: unknown) {
            message.error(e instanceof Error ? e.message : "Something went wrong");
        }
    }, [config, navigate]);

    return { form, draftRef, loading, onFinish };
};
