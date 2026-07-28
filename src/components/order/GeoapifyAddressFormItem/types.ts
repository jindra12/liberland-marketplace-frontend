import type { NamePath } from "antd/es/form/interface";

export type GeoapifyAddressFormItemProps = {
    name: NamePath;
    label: string;
    required?: boolean;
};

export type GeoapifyFeatureProperties = {
    formatted?: string;
    housenumber?: string;
    street?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    postcode?: string;
    country?: string;
};

export type GeoapifyFeature =
    | {
          properties?: GeoapifyFeatureProperties;
      }
    | null
    | undefined;

export type AddressFields = {
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    country?: string | null;
};

export type AddressFieldKey = keyof AddressFields;

export type GeoapifyAddressSelection = AddressFields & {
    formattedAddress?: string;
};
