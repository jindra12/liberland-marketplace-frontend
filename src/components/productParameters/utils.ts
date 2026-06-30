import type { MutationProduct_ParametersInput } from "../../generated/graphql";

import type {
    ProductParameterDraft,
    ProductParameterSelectionFormValue,
    ProductParameterSelectionMap,
    ProductParameterSource,
} from "./types";

export type ProductParameterMutationValueInput = {
    id?: string | null;
    key: string;
    name: string;
    selected?: boolean | null;
};

export type ProductParameterMutationInput = {
    id?: string | null;
    name: string;
    values?: ProductParameterMutationValueInput[] | null;
};

const normalizeSpaces = (value: string) => value.replace(/\s+/g, "-");

export const buildProductParameterKey = (value: string) =>
    normalizeSpaces(
        value
            .normalize("NFD")
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/-+/g, "-"),
    ).replace(/^-+|-+$/g, "");

const resolveParameterValueKey = (value: { key?: string | null; name?: string | null }) =>
    value.key || buildProductParameterKey(value.name || "");

const getDefaultSelectedValueKey = (values: ProductParameterSource["values"]) => {
    const selectedValue = (values || []).find((value) => value?.selected || value?.default);
    if (selectedValue?.key) {
        return selectedValue.key;
    }

    const firstValue = (values || []).find((value) => Boolean(value?.key || value?.name));
    return firstValue?.key || undefined;
};

export const buildProductParameterSelectionMap = (parameters?: ProductParameterSource[] | null) =>
    (parameters || []).reduce<ProductParameterSelectionMap>((acc, parameter) => {
        if (!parameter?.name) {
            return acc;
        }

        const selectedValueKey = getDefaultSelectedValueKey(parameter.values);

        if (!selectedValueKey) {
            return acc;
        }

        acc[parameter.name] = selectedValueKey;
        return acc;
    }, {});

const buildMutationParameterValues = (
    values: ProductParameterSource["values"],
    selectedValueKey: string | undefined,
) => {
    return (values || [])
        .filter((value) => Boolean(value?.name))
        .map((value) => ({
            id: value?.id,
            key: resolveParameterValueKey(value || {}),
            name: value?.name || "",
            selected: value?.key ? value.key === selectedValueKey : buildProductParameterKey(value?.name || "") === selectedValueKey,
        }));
};

export const buildProductParametersInput = (
    parameters?: ProductParameterDraft[] | null,
): MutationProduct_ParametersInput[] | undefined => {
    const mapped = (parameters || [])
        .filter((parameter) => Boolean(parameter?.name))
        .map((parameter) => ({
            id: parameter?.id,
            name: parameter?.name || "",
            values: (parameter?.values || [])
                .filter((value) => Boolean(value?.name))
                .map((value) => ({
                    id: value?.id,
                    key: buildProductParameterKey(value?.name || ""),
                    name: value?.name || "",
                    default: value?.default,
                })),
        }))
        .filter((parameter) => (parameter.values || []).length > 0);

    return mapped.length > 0 ? mapped : undefined;
};

export const buildProductParameterFormValues = (
    parameters?: ProductParameterSource[] | null,
    selectedValues?: ProductParameterSelectionMap | null,
): ProductParameterSelectionFormValue[] | undefined => {
    const mapped = (parameters || [])
        .filter((parameter) => Boolean(parameter?.name))
        .map((parameter) => ({
            id: parameter?.id,
            name: parameter?.name || "",
            selectedValue: selectedValues?.[parameter?.name || ""] || getDefaultSelectedValueKey(parameter?.values) || null,
        }));

    return mapped.length > 0 ? mapped : undefined;
};

export const buildProductParameterSelectionMapFromFormValues = (
    parameters?: ProductParameterSelectionFormValue[] | null,
) =>
    (parameters || []).reduce<ProductParameterSelectionMap>((acc, parameter) => {
        if (!parameter?.name || !parameter.selectedValue) {
            return acc;
        }

        acc[parameter.name] = parameter.selectedValue;
        return acc;
    }, {});

export const buildSelectedProductParametersInput = (
    parameters?: ProductParameterSource[] | null,
    selectedValues?: ProductParameterSelectionMap | null,
): ProductParameterMutationInput[] | undefined => {
    const mapped = (parameters || [])
        .filter((parameter) => Boolean(parameter?.name))
        .map((parameter) => {
            const selectedValueKey =
                selectedValues?.[parameter.name || ""] || getDefaultSelectedValueKey(parameter?.values);

            return {
                id: parameter?.id,
                name: parameter?.name || "",
                values: buildMutationParameterValues(parameter?.values, selectedValueKey),
            };
        })
        .filter((parameter) => (parameter.values || []).length > 0);

    return mapped.length > 0 ? mapped : undefined;
};
