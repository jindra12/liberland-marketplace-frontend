import * as React from "react";
import { Button, Modal, Typography } from "antd";
import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import type { CSSProperties } from "react";
import type { GeoapifyFeature } from "./types";

type GeoapifyAddressSearchModalProps = {
    open: boolean;
    geoapifyApiKey: string;
    searchValue: string;
    geoapifyStyles: CSSProperties;
    onCancel: () => void;
    onSearchValueChange: (value: string) => void;
    onPlaceSelect: (feature: GeoapifyFeature) => void;
};

export const GeoapifyAddressSearchModal: React.FunctionComponent<GeoapifyAddressSearchModalProps> = ({
    open,
    geoapifyApiKey,
    searchValue,
    geoapifyStyles,
    onCancel,
    onSearchValueChange,
    onPlaceSelect,
}) => {
    if (!geoapifyApiKey) {
        return null;
    }

    return (
        <Modal
            open={open}
            title="Search address"
            className="Order__geoapifyModal"
            onCancel={onCancel}
            maskClosable
            destroyOnHidden
            footer={[
                <Button
                    key="cancel"
                    danger
                    type="primary"
                    onClick={onCancel}
                >
                    Cancel
                </Button>,
            ]}
        >
            <Typography.Paragraph className="Order__geoapifyModalCopy">
                Start typing and select a suggestion to add the shipping address.
            </Typography.Paragraph>

            <div className="Order__geoapifyInput" style={geoapifyStyles}>
                <GeoapifyContext apiKey={geoapifyApiKey}>
                    <GeoapifyGeocoderAutocomplete
                        placeholder="Search shipping address"
                        lang="en"
                        limit={8}
                        addDetails
                        value={searchValue}
                        onUserInput={onSearchValueChange}
                        placeSelect={onPlaceSelect}
                    />
                </GeoapifyContext>
            </div>
        </Modal>
    );
};
