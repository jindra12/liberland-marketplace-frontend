import type { UploadFile } from "antd/es/upload/interface";

import type {
    Startup_AlreadyHave_MutationInput,
    Startup_LookingFor_MutationInput,
    Startup_Stage_MutationInput,
} from "../../../generated/graphql";

export type StartupFormValues = {
    title: string;
    description?: string;
    company?: string;
    identity?: string;
    stage: Startup_Stage_MutationInput;
    lookingFor?: Startup_LookingFor_MutationInput[];
    alreadyHave?: Startup_AlreadyHave_MutationInput[];
    fundsNeededAmount?: number | null;
    fundsNeededCurrency?: string | null;
    imageFile?: UploadFile[];
};

export type StartupFormProps = {
    mode: "create" | "edit";
    url: string;
    initialValues?: Partial<StartupFormValues> & {
        id?: string;
        existingImageUrl?: string | null;
        existingImageId?: string | null;
    };
};

export type StartupFormSelectOption = {
    value: string;
    label: string;
};

export type StartupFormBasicsFieldsProps = {
    companyOptions: StartupFormSelectOption[];
    existingImageUrl?: string | null;
    identityOptions: StartupFormSelectOption[];
    isCompaniesLoading: boolean;
    isIdentitiesLoading: boolean;
    url: string;
};
