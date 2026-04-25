import {
    Startup_AlreadyHave,
    Startup_AlreadyHave_MutationInput,
    Startup_LookingFor,
    Startup_LookingFor_MutationInput,
    Startup_Stage,
    Startup_Stage_MutationInput,
} from "../../../generated/graphql";

import type { StartupFormProps, StartupFormSelectOption, StartupFormValues } from "./types";

export const buildStartupFormDefaults = (props: StartupFormProps): Partial<StartupFormValues> => {
    return {
        stage: Startup_Stage_MutationInput.Idea,
        ...props.initialValues,
    };
};

const STARTUP_STAGE_MUTATION_INPUT: Record<Startup_Stage, Startup_Stage_MutationInput> = {
    [Startup_Stage.Early]: Startup_Stage_MutationInput.Early,
    [Startup_Stage.Established]: Startup_Stage_MutationInput.Established,
    [Startup_Stage.Idea]: Startup_Stage_MutationInput.Idea,
    [Startup_Stage.Mvp]: Startup_Stage_MutationInput.Mvp,
    [Startup_Stage.Scaling]: Startup_Stage_MutationInput.Scaling,
};

const STARTUP_LOOKING_FOR_MUTATION_INPUT: Record<Startup_LookingFor, Startup_LookingFor_MutationInput> = {
    [Startup_LookingFor.Distribution]: Startup_LookingFor_MutationInput.Distribution,
    [Startup_LookingFor.Founders]: Startup_LookingFor_MutationInput.Founders,
    [Startup_LookingFor.Funding]: Startup_LookingFor_MutationInput.Funding,
    [Startup_LookingFor.Idea]: Startup_LookingFor_MutationInput.Idea,
    [Startup_LookingFor.Product]: Startup_LookingFor_MutationInput.Product,
    [Startup_LookingFor.Production]: Startup_LookingFor_MutationInput.Production,
    [Startup_LookingFor.Team]: Startup_LookingFor_MutationInput.Team,
    [Startup_LookingFor.Traction]: Startup_LookingFor_MutationInput.Traction,
};

const STARTUP_ALREADY_HAVE_MUTATION_INPUT: Record<Startup_AlreadyHave, Startup_AlreadyHave_MutationInput> = {
    [Startup_AlreadyHave.Distribution]: Startup_AlreadyHave_MutationInput.Distribution,
    [Startup_AlreadyHave.Founders]: Startup_AlreadyHave_MutationInput.Founders,
    [Startup_AlreadyHave.Funding]: Startup_AlreadyHave_MutationInput.Funding,
    [Startup_AlreadyHave.Idea]: Startup_AlreadyHave_MutationInput.Idea,
    [Startup_AlreadyHave.Product]: Startup_AlreadyHave_MutationInput.Product,
    [Startup_AlreadyHave.Production]: Startup_AlreadyHave_MutationInput.Production,
    [Startup_AlreadyHave.Team]: Startup_AlreadyHave_MutationInput.Team,
    [Startup_AlreadyHave.Traction]: Startup_AlreadyHave_MutationInput.Traction,
};

export const toStartupStageMutationInput = (value?: Startup_Stage | null): Startup_Stage_MutationInput | undefined =>
    value ? STARTUP_STAGE_MUTATION_INPUT[value] : undefined;

export const toStartupLookingForMutationInput = (
    values?: Startup_LookingFor[] | null,
): Startup_LookingFor_MutationInput[] | undefined => values?.map((value) => STARTUP_LOOKING_FOR_MUTATION_INPUT[value]);

export const toStartupAlreadyHaveMutationInput = (
    values?: Startup_AlreadyHave[] | null,
): Startup_AlreadyHave_MutationInput[] | undefined => values?.map((value) => STARTUP_ALREADY_HAVE_MUTATION_INPUT[value]);

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
