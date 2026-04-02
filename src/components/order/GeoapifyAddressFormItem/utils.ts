import { theme } from "antd";
import type { NamePath } from "antd/es/form/interface";
import type { CSSProperties } from "react";
import type { AddressFields, GeoapifyAddressSelection, GeoapifyFeature, GeoapifyFeatureProperties } from "./types";

type ThemeToken = ReturnType<typeof theme.useToken>["token"];

export const toPath = (name: NamePath): Array<string | number> => {
    return Array.isArray(name) ? name : [name];
};

const buildAddressLine1 = (properties: GeoapifyFeatureProperties) => {
    const lineFromParts = [properties.housenumber, properties.street].filter(Boolean).join(" ");

    return lineFromParts || properties.address_line1 || properties.formatted;
};

export const getAddressSelection = (feature: GeoapifyFeature): GeoapifyAddressSelection | undefined => {
    const properties = feature?.properties;
    if (!properties) {
        return undefined;
    }

    return {
        formattedAddress: properties.formatted,
        addressLine1: buildAddressLine1(properties),
        addressLine2: properties.address_line2,
        city: properties.city || properties.town || properties.village || properties.county,
        state: properties.state,
        postalCode: properties.postcode,
        country: properties.country,
    };
};

export const buildAddressSummary = (address?: AddressFields) => {
    return [address?.addressLine1, address?.addressLine2, address?.city, address?.state, address?.postalCode, address?.country].filter(Boolean).join(", ");
};

export const createGeoapifyStyles = (token: ThemeToken): CSSProperties => {
    return {
        "--geoapify-bg-container": token.colorBgContainer,
        "--geoapify-bg-elevated": token.colorBgElevated,
        "--geoapify-text": token.colorText,
        "--geoapify-text-secondary": token.colorTextSecondary,
        "--geoapify-text-tertiary": token.colorTextTertiary,
        "--geoapify-text-placeholder": token.colorTextPlaceholder,
        "--geoapify-border": token.colorBorder,
        "--geoapify-border-secondary": token.colorBorderSecondary,
        "--geoapify-shadow": token.boxShadowSecondary,
        "--geoapify-hover-bg": token.controlItemBgHover,
        "--geoapify-outline": token.controlOutline,
        "--geoapify-primary-border": token.colorPrimaryBorder,
        "--geoapify-radius": `${token.borderRadius}px`,
    } as CSSProperties;
};
