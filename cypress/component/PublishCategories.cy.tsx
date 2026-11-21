import React from "react";
import { Flex } from "antd";
import { PublishCategoryPicker } from "../../src/components/publish/PublishCategoryPicker";
import { mountWithProviders } from "../support/component-tests/directBasic";

describe("publish category layout", () => {
    [390, 1440].forEach((width) => {
        it(`separates category titles from descriptions at ${width}px`, () => {
            cy.viewport(width, 1000);
            const selectCategory = cy.stub().as("selectCategory");
            mountWithProviders(
                <Flex vertical className="Publish">
                    <PublishCategoryPicker onSelect={selectCategory} />
                </Flex>,
                { route: "/publish" },
            );
            cy.get(".Publish__category").should("have.length", 5).each(($button) => {
                const title = $button.find(".Publish__categoryTitle")[0];
                const description = $button.find(".ant-typography-secondary")[0];
                expect(description.getBoundingClientRect().top).to.be.greaterThan(title.getBoundingClientRect().bottom);
                expect($button[0].scrollWidth).to.be.at.most($button[0].clientWidth);
            });
            cy.get(".Publish").screenshot(`publish-categories-${width}`);
            cy.contains(".Publish__category", "Company").click();
            cy.get("@selectCategory").should("have.been.calledWith", "publish-company");
        });
    });
});
