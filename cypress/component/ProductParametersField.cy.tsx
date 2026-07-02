import * as React from "react";

import { Form } from "antd";
import { mount } from "cypress/react";

import { AntProvider } from "../../src/components/AntProvider";
import { ProductParametersField } from "../../src/components/productParameters/ProductParametersField";

import { screenshotStep } from "../support/component-tests/utils";

const Harness: React.FunctionComponent = () => {
    const [form] = Form.useForm();

    return (
        <AntProvider>
            <Form form={form} initialValues={{ parameters: [] }}>
                <ProductParametersField />
            </Form>
        </AntProvider>
    );
};

describe("ProductParametersField", () => {
    it("lets sellers add a parameter with a single default value", () => {
        cy.viewport(1200, 1200);
        mount(<Harness />);

        cy.contains("button", "Add property").click();
        cy.contains(".Publish__parameterCard", "Property name").should("be.visible");
        cy.contains(".Publish__parameterNameField", "Property name")
            .find("input")
            .last()
            .clear({ force: true })
            .type("Size", { force: true });
        cy.contains(".Publish__parameterValueNameField", "Value name")
            .find("input")
            .last()
            .clear({ force: true })
            .type("Large", { force: true });
        cy.contains("button", "Add value").click();
        cy.contains(".Publish__parameterValueNameField", "Value name")
            .last()
            .find("input")
            .clear({ force: true })
            .type("Medium", { force: true });
        cy.get(".Publish__parameterValueCard")
            .eq(1)
            .find("input[type=\"checkbox\"]")
            .check({ force: true });
        cy.get(".Publish__parameterValueCard")
            .eq(0)
            .find("input[type=\"checkbox\"]")
            .should("not.be.checked");
        cy.get(".Publish__parameterValueCard")
            .eq(1)
            .find("input[type=\"checkbox\"]")
            .should("be.checked");
        cy.contains(".Publish__parameterCard", "Key is generated from the value name automatically.").should(
            "be.visible",
        );
        cy.contains(".Publish__parameterValueDefaultField", "Default").should("be.visible");

        screenshotStep("product-parameters-field");
    });
});
