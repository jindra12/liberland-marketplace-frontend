import { useAuth } from "react-oidc-context";

import { useCreateStartupMutation, useListIdentitiesQuery, useUpdateStartupMutation } from "../../hooks";
import { useEntityForm } from "../useEntityForm";

import { buildStartupFormDefaults, buildStartupMutationData, toStartupSelectOptions } from "./utils";
import type { StartupFormProps, StartupFormValues } from "./types";

export const useStartupFormModel = (props: StartupFormProps) => {
    const auth = useAuth();
    const createMutation = useCreateStartupMutation();
    const updateMutation = useUpdateStartupMutation();
    const identitiesQuery = useListIdentitiesQuery({
        limit: 100,
        url: props.url,
    });
    const identities = identitiesQuery.data?.Identities?.docs ?? [];
    const entityForm = useEntityForm({
        entityName: "Startup",
        routePrefix: "/ventures",
        mode: props.mode,
        existingImageId: props.initialValues?.existingImageId,
        editId: props.initialValues?.id,
        createMutation,
        updateMutation,
        url: props.url,
        buildData: (values: StartupFormValues, imageId) => {
            return buildStartupMutationData(values, imageId);
        },
        getCreateId: (result) => result.createStartup?.id,
        getUpdateId: (result) => result.updateStartup?.id,
    });

    return {
        defaults: buildStartupFormDefaults(props),
        draftRef: entityForm.draftRef,
        form: entityForm.form,
        identityOptions: toStartupSelectOptions(identities),
        isIdentitiesLoading: identitiesQuery.isLoading,
        loading: entityForm.loading,
        onFinish: entityForm.onFinish,
        userId: auth.user?.profile?.sub,
    };
};
