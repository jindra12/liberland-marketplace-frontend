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
export const GeoapifyAddressSearchModal: React.FunctionComponent<GeoapifyAddressSearchModalProps> = (props) => {
    if (!props.geoapifyApiKey) {
        return null;
    }
    return (
        <Modal
            open={props.open}
            title="Search address"
            className="Order__geoapifyModal"
            onCancel={props.onCancel}
            maskClosable
            destroyOnHidden
            footer={[
                <Button key="cancel" danger type="primary" onClick={props.onCancel}>
                    Cancel
                </Button>,
            ]}
        >
            <Typography.Paragraph className="Order__geoapifyModalCopy">Start typing and select a suggestion to add the shipping address.</Typography.Paragraph>

            <div className="Order__geoapifyInput" style={props.geoapifyStyles}>
                <GeoapifyContext apiKey={props.geoapifyApiKey}>
                    <GeoapifyGeocoderAutocomplete
                        placeholder="Search shipping address"
                        lang="en"
                        limit={8}
                        addDetails
                        value={props.searchValue}
                        onUserInput={props.onSearchValueChange}
                        placeSelect={props.onPlaceSelect}
                    />
                </GeoapifyContext>
            </div>
        </Modal>
    );
};
