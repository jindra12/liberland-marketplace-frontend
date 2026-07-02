import * as React from "react";

import { Card, Typography } from "antd";
import { mount } from "cypress/react";

import { ProductCarousel } from "../../src/components/cards/ProductCarousel";
import { combineUniqueById } from "../../src/components/detail/utils";

import { screenshotStep } from "../support/component-tests/utils";

type CarouselItem = {
    id: string;
    name: string;
};

const buildItem = (id: string, name: string): CarouselItem => ({
    id,
    name,
});

const CarouselHarness: React.FunctionComponent<{ items: CarouselItem[] }> = (props) => {
    if (props.items.length === 0) {
        return null;
    }

    return (
        <ProductCarousel
            className="ProductCarouselHarness"
            items={props.items}
            renderItem={(item) => (
                <Card className="ProductCarouselHarness__itemCard" bordered={false}>
                    <Typography.Title level={4} className="ProductCarouselHarness__itemTitle">
                        {item.name}
                    </Typography.Title>
                </Card>
            )}
        />
    );
};

describe("ProductCarousel", () => {
    it("shows all six products when the detail data already has six", () => {
        cy.viewport(1200, 1200);
        mount(
            <CarouselHarness
                items={[
                    buildItem("product-a", "Related A"),
                    buildItem("product-b", "Related B"),
                    buildItem("product-c", "Related C"),
                    buildItem("product-d", "Related D"),
                    buildItem("product-e", "Related E"),
                    buildItem("product-f", "Related F"),
                ]}
            />,
        );

        cy.get(".ProductCarouselHarness__itemTitle").should(($titles) => {
            const renderedTitles = Array.from($titles, (title) => title.textContent?.trim() || "");
            expect(new Set(renderedTitles).size).to.equal(6);
            expect(renderedTitles).to.include.members([
                "Related A",
                "Related B",
                "Related C",
                "Related D",
                "Related E",
                "Related F",
            ]);
        });
        screenshotStep("product-carousel-six-items");
    });

    it("fills the carousel to five items and skips duplicates", () => {
        cy.viewport(1200, 1200);
        const curatedProducts = [
            buildItem("product-a", "Curated A"),
            buildItem("product-b", "Curated B"),
            buildItem("product-c", "Curated C"),
        ];
        const fallbackProducts = [
            buildItem("product-c", "Curated C"),
            buildItem("product-d", "Fallback D"),
            buildItem("product-e", "Fallback E"),
        ];

        mount(<CarouselHarness items={combineUniqueById(curatedProducts, fallbackProducts, 5)} />);

        cy.get(".ProductCarouselHarness__itemTitle").should(($titles) => {
            const renderedTitles = Array.from($titles, (title) => title.textContent?.trim() || "");
            expect(new Set(renderedTitles).size).to.equal(5);
            expect(renderedTitles).to.include.members(["Curated A", "Curated B", "Curated C", "Fallback D", "Fallback E"]);
        });
        screenshotStep("product-carousel-five-unique-items");
    });

    it("does not render any empty carousel space when there are no products", () => {
        cy.viewport(1200, 1200);
        mount(<CarouselHarness items={[]} />);

        cy.get(".ProductCarouselHarness").should("not.exist");
        cy.get(".ProductCarouselHarness__itemCard").should("not.exist");
        screenshotStep("product-carousel-empty");
    });
});
