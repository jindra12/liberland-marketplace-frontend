import * as React from "react";
import { Alert, Col, Form, Input, Row, theme } from "antd";
import type { NamePath } from "antd/es/form/interface";
import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";

type GeoapifyAddressFormItemProps = {
    name?: NamePath;
    label?: string;
    required?: boolean;
};

type FeatureProperties = {
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

const toPath = (name: NamePath): Array<string | number> => {
    return Array.isArray(name) ? name : [name];
};

const readText = (value: unknown) => {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
};

const buildAddressLine1 = (properties: FeatureProperties) => {
    const lineFromParts = [readText(properties.housenumber), readText(properties.street)]
        .filter(Boolean)
        .join(" ")
        .trim();

    return lineFromParts
        || readText(properties.address_line1)
        || readText(properties.formatted);
};

export const GeoapifyAddressFormItem: React.FunctionComponent<GeoapifyAddressFormItemProps> = ({
    name = ["shippingAddress"],
    label = "Shipping address",
    required = true,
}) => {
    const { token } = theme.useToken();
    const form = Form.useFormInstance();
    const [searchValue, setSearchValue] = React.useState("");
    const basePath = React.useMemo(() => toPath(name), [name]);
    const geoapifyApiKey = (process.env.REACT_APP_GEOAPIFY_API_KEY || "").trim();
    const geoapifyStyles = React.useMemo(() => ({
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
    } as React.CSSProperties), [token]);

    const setAddressField = React.useCallback((field: string, value?: string) => {
        form.setFieldValue([...basePath, field], value);
    }, [basePath, form]);

    const handlePlaceSelect = React.useCallback((feature: { properties?: FeatureProperties } | null | undefined) => {
        const properties = feature?.properties;
        if (!properties) {
            return;
        }

        setSearchValue(readText(properties.formatted) || "");
        setAddressField("addressLine1", buildAddressLine1(properties));
        setAddressField("addressLine2", readText(properties.address_line2));
        setAddressField("city", readText(properties.city) || readText(properties.town) || readText(properties.village) || readText(properties.county));
        setAddressField("state", readText(properties.state));
        setAddressField("postalCode", readText(properties.postcode));
        setAddressField("country", readText(properties.country));
    }, [setAddressField]);

    const requiredRule = required ? [{ required: true, message: "Required" }] : [];

    return (
        <>
            <Form.Item
                label={label}
                required={required}
                className="Order__geoapifySearchItem"
                extra={geoapifyApiKey
                    ? "Start typing and pick a suggestion, then adjust fields below if needed."
                    : "Geoapify key is missing. Enter the shipping address manually below."}
            >
                {geoapifyApiKey ? (
                    <div className="Order__geoapifyInput" style={geoapifyStyles}>
                        <GeoapifyContext apiKey={geoapifyApiKey}>
                            <GeoapifyGeocoderAutocomplete
                                placeholder="Search shipping address"
                                lang="en"
                                limit={8}
                                addDetails
                                value={searchValue}
                                onUserInput={setSearchValue}
                                placeSelect={handlePlaceSelect}
                            />
                        </GeoapifyContext>
                    </div>
                ) : (
                    <Alert
                        type="warning"
                        showIcon
                        message="Address autocomplete unavailable"
                        description="Set REACT_APP_GEOAPIFY_API_KEY to enable Geoapify suggestions."
                    />
                )}
            </Form.Item>

            <Form.Item name={[...basePath, "addressLine1"]} label="Address line 1" rules={requiredRule}>
                <Input placeholder="Street and house number" />
            </Form.Item>

            <Form.Item name={[...basePath, "addressLine2"]} label="Address line 2">
                <Input placeholder="Apartment, suite, unit, etc. (optional)" />
            </Form.Item>

            <Row gutter={12}>
                <Col xs={24} md={12}>
                    <Form.Item name={[...basePath, "city"]} label="City" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={[...basePath, "state"]} label="State / Region">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={12}>
                <Col xs={24} md={12}>
                    <Form.Item name={[...basePath, "postalCode"]} label="Postal code" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={[...basePath, "country"]} label="Country" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};
