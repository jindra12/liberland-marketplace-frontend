import * as React from "react";

import { Divider, Form, theme } from "antd";

import { GeoapifyAddressFields } from "./GeoapifyAddressFields";
import { GeoapifyAddressSearchControl } from "./GeoapifyAddressSearchControl";
import { GeoapifyAddressSearchModal } from "./GeoapifyAddressSearchModal";
import type { AddressFieldKey, AddressFields, GeoapifyAddressFormItemProps, GeoapifyFeature } from "./types";
import { buildAddressSummary, createGeoapifyStyles, getAddressSelection, toPath } from "./utils";

export const GeoapifyAddressFormItem: React.FunctionComponent<GeoapifyAddressFormItemProps> = (props) => {
    const { token } = theme.useToken();
    const form = Form.useFormInstance();
    const [searchValue, setSearchValue] = React.useState("");
    const [isSearchModalOpen, setIsSearchModalOpen] = React.useState(false);
    const basePath = React.useMemo(() => toPath(props.name), [props.name]);
    const watchedAddress = Form.useWatch(basePath, form) as AddressFields | undefined;
    const geoapifyApiKey = process.env.REACT_APP_GEOAPIFY_API_KEY || "";
    const geoapifyStyles = React.useMemo(() => createGeoapifyStyles(token), [token]);
    const selectedAddressSummary = React.useMemo(() => buildAddressSummary(watchedAddress), [watchedAddress]);

    const setAddressField = React.useCallback(
        (field: AddressFieldKey, value?: string | null) => {
            form.setFieldValue([...basePath, field], value);
        },
        [basePath, form],
    );

    const closeSearchModal = React.useCallback(() => {
        setIsSearchModalOpen(false);
    }, []);

    const openSearchModal = React.useCallback(() => {
        if (!searchValue && selectedAddressSummary) {
            setSearchValue(selectedAddressSummary);
        }

        setIsSearchModalOpen(true);
    }, [searchValue, selectedAddressSummary]);

    const handlePlaceSelect = React.useCallback(
        (feature: GeoapifyFeature) => {
            const selection = getAddressSelection(feature);
            if (!selection) {
                return;
            }

            setSearchValue(selection.formattedAddress || "");
            setAddressField("addressLine1", selection.addressLine1);
            setAddressField("addressLine2", selection.addressLine2);
            setAddressField("city", selection.city);
            setAddressField("state", selection.state);
            setAddressField("postalCode", selection.postalCode);
            setAddressField("country", selection.country);
            setIsSearchModalOpen(false);
        },
        [setAddressField],
    );

    return (
        <>
            {geoapifyApiKey && (
                <GeoapifyAddressSearchControl
                    label={props.label}
                    required={props.required}
                    geoapifyApiKey={geoapifyApiKey}
                    selectedAddressSummary={selectedAddressSummary}
                    onOpenSearch={openSearchModal}
                />
            )}
            <Divider />
            <GeoapifyAddressSearchModal
                open={isSearchModalOpen}
                geoapifyApiKey={geoapifyApiKey}
                searchValue={searchValue}
                geoapifyStyles={geoapifyStyles}
                onCancel={closeSearchModal}
                onSearchValueChange={setSearchValue}
                onPlaceSelect={handlePlaceSelect}
            />
            <GeoapifyAddressFields basePath={basePath} required={props.required} />
        </>
    );
};
