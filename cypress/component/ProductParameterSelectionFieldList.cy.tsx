import * as React from "react";

import { Form } from "antd";
import { mount } from "cypress/react";

import { AntProvider } from "../../src/components/AntProvider";
import { ProductParameterSelectionFieldList } from "../../src/components/productParameters/ProductParameterSelectionFieldList";
import { buildProductParameterFormValues } from "../../src/components/productParameters/utils";
import type { ProductParameterSource } from "../../src/components/productParameters/types";

import { screenshotStep } from "../support/component-tests/utils";

const parameters: ProductParameterSource[] = [
    {
        id: "size",
        name: "Size",
        values: [
            { id: "size-s", key: "s", name: "Small", default: true },
            { id: "size-l", key: "l", name: "Large" },
        ],
    },
    {
        id: "color",
        name: "Color",
        values: [
            { id: "color-red", key: "red", name: "Red" },
            { id: "color-blue", key: "blue", name: "Blue" },
        ],
    },
    {
        id: "invalid",
        name: "",
        values: [],
    },
];

const Harness: React.FunctionComponent = () => {
    const [form] = Form.useForm();

    return (
        <AntProvider>
            <Form
                form={form}
                initialValues={{
                    parameters: buildProductParameterFormValues(parameters, {
                        Size: "s",
                        Color: "blue",
                    }),
                }}
            >
                <ProductParameterSelectionFieldList parameters={parameters} />
            </Form>
        </AntProvider>
    );
};

describe("ProductParameterSelectionFieldList", () => {
    it("renders the available selectable properties and keeps the current selection", () => {
        cy.viewport(1200, 1200);
        mount(<Harness />);

        cy.get(".ProductParameterSelector__card").should("have.length", 2);
        cy.contains(".ProductParameterSelector__label", "Size").should("be.visible");
        cy.contains(".ProductParameterSelector__label", "Color").should("be.visible");
        cy.get(".ProductParameterSelector__card")
            .first()
            .find(".ant-select-selection-item")
            .should("contain.text", "Small");
        cy.get(".ProductParameterSelector__card")
            .last()
            .find(".ant-select-selection-item")
            .should("contain.text", "Blue");

        cy.get(".ProductParameterSelector__card")
            .first()
            .find(".ant-select-selector")
            .click({ force: true });
        cy.get(".ant-select-dropdown").should("be.visible");
        cy.contains(".ant-select-dropdown .ant-select-item-option-content", "Large")
            .should("be.visible")
            .click({ force: true });
        cy.get(".ProductParameterSelector__card")
            .first()
            .find(".ant-select-selection-item")
            .should("contain.text", "Large");

        screenshotStep("product-parameter-selection-field-list");
    });
});
