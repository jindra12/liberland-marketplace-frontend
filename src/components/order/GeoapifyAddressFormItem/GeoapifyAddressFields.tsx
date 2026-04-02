import * as React from "react";

import { Col, Form, Input, Row } from "antd";

type GeoapifyAddressFieldsProps = {
    basePath: Array<string | number>;
    required: boolean;
};
export const GeoapifyAddressFields: React.FunctionComponent<GeoapifyAddressFieldsProps> = (props) => {
    const requiredRule = props.required
        ? [
              {
                  required: true,
                  message: "Required",
              },
          ]
        : [];
    return (
        <>
            <Form.Item name={[...props.basePath, "addressLine1"]} label="Address line 1" rules={requiredRule}>
                <Input placeholder="Street and house number" />
            </Form.Item>

            <Form.Item name={[...props.basePath, "addressLine2"]} label="Address line 2">
                <Input placeholder="Apartment, suite, unit, etc. (optional)" />
            </Form.Item>

            <Row gutter={12}>
                <Col xs={24} md={12}>
                    <Form.Item name={[...props.basePath, "city"]} label="City" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={[...props.basePath, "state"]} label="State / Region">
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={12}>
                <Col xs={24} md={12}>
                    <Form.Item name={[...props.basePath, "postalCode"]} label="Postal code" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item name={[...props.basePath, "country"]} label="Country" rules={requiredRule}>
                        <Input />
                    </Form.Item>
                </Col>
            </Row>
        </>
    );
};
