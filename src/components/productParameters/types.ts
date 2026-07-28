export type ProductParameterValueDraft = {
    id?: string | null;
    name?: string | null;
    default?: boolean | null;
};

export type ProductParameterDraft = {
    id?: string | null;
    name?: string | null;
    values?: ProductParameterValueDraft[] | null;
};

export type ProductParameterSelectionMap = Record<string, string>;

export type ProductParameterSelectionFormValue = {
    id?: string | null;
    name?: string | null;
    selectedValue?: string | null;
};

export type ProductParameterValueSource = {
    id?: string | null;
    key?: string | null;
    name?: string | null;
    default?: boolean | null;
    selected?: boolean | null;
};

export type ProductParameterSource = {
    id?: string | null;
    name?: string | null;
    values?: ProductParameterValueSource[] | null;
};
