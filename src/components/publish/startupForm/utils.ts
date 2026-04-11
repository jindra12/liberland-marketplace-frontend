import { Startup_Stage_MutationInput } from "../../../generated/graphql";

import type { StartupFormProps, StartupFormSelectOption, StartupFormValues } from "./types";

export const buildStartupFormDefaults = (props: StartupFormProps): Partial<StartupFormValues> => {
    return {
        stage: Startup_Stage_MutationInput.Idea,
        ...props.initialValues,
    };
};

export const buildStartupMutationData = (
    values: StartupFormValues,
    imageId: string | undefined | null,
) => {
    return {
        title: values.title,
        description: values.description,
        company: values.company,
        identity: values.identity,
        stage: values.stage,
        ...(values.lookingFor?.length
            ? {
                  lookingFor: values.lookingFor,
              }
            : {}),
        ...(values.alreadyHave?.length
            ? {
                  alreadyHave: values.alreadyHave,
              }
            : {}),
        ...(imageId !== undefined
            ? {
                  image: imageId,
              }
            : {}),
        ...(typeof values.fundsNeededAmount === "number"
            ? {
                  fundsNeeded: {
                      amount: values.fundsNeededAmount,
                      currency: values.fundsNeededCurrency || "USD",
                  },
              }
            : {}),
    };
};

export const toStartupSelectOptions = (entries: Array<{ id: string; name?: string | null }>) => {
    return entries.reduce<StartupFormSelectOption[]>((options, entry) => {
        if (!entry.name) {
            return options;
        }

        return [
            ...options,
            {
                value: entry.id,
                label: entry.name,
            },
        ];
    }, []);
};
