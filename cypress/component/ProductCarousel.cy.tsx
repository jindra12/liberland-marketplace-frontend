import * as React from "react";

import { Card, Typography } from "antd";
import { mount } from "cypress/react";

import { AntProvider } from "../../src/components/AntProvider";
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
        <AntProvider>
            <ProductCarousel
                className="ProductCarouselHarness"
                items={props.items}
                renderItem={(item) => (
                    <Card className="SplashEntityCard__itemCard ProductCarouselHarness__itemCard" bordered={false}>
                        <Typography.Title level={4} className="ProductCarouselHarness__itemTitle">
                            {item.name}
                        </Typography.Title>
                    </Card>
                )}
            />
        </AntProvider>
    );
};

const assertCarouselArrowCentered = () => {
    cy.get(".ProductCarouselHarness .slick-prev").then(($prev) => {
        cy.get(".ProductCarouselHarness").then(($carousel) => {
            const prevRect = $prev[0].getBoundingClientRect();
            const carouselRect = $carousel[0].getBoundingClientRect();
            expect(Math.abs(prevRect.top + prevRect.height / 2 - (carouselRect.top + carouselRect.height / 2))).to.be.lessThan(2);
        });
    });

    cy.get(".ProductCarouselHarness .slick-next").then(($next) => {
        cy.get(".ProductCarouselHarness").then(($carousel) => {
            const nextRect = $next[0].getBoundingClientRect();
            const carouselRect = $carousel[0].getBoundingClientRect();
            expect(Math.abs(nextRect.top + nextRect.height / 2 - (carouselRect.top + carouselRect.height / 2))).to.be.lessThan(2);
        });
    });
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

        cy.get("body").should("have.css", "background-color", "rgb(3, 13, 23)");
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
        assertCarouselArrowCentered();
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

    it("stacks five products vertically on mobile", () => {
        cy.viewport(390, 844);
        mount(
            <CarouselHarness
                items={[
                    buildItem("product-a", "Mobile A"),
                    buildItem("product-b", "Mobile B"),
                    buildItem("product-c", "Mobile C"),
                    buildItem("product-d", "Mobile D"),
                    buildItem("product-e", "Mobile E"),
                    buildItem("product-f", "Mobile F"),
                ]}
            />,
        );

        cy.get(".ProductCarouselHarness .SplashEntityCard__stackItem").should("have.length", 5);
        cy.get(".ProductCarouselHarness .SplashEntityCard__carousel").should("not.exist");
        cy.get(".ProductCarouselHarness__itemTitle").should(($titles) => {
            const renderedTitles = Array.from($titles, (title) => title.textContent?.trim() || "");
            expect(renderedTitles).to.deep.equal(["Mobile A", "Mobile B", "Mobile C", "Mobile D", "Mobile E"]);
        });
        screenshotStep("product-carousel-mobile-stack");
    });

    it("does not render any empty carousel space when there are no products", () => {
        cy.viewport(1200, 1200);
        mount(<CarouselHarness items={[]} />);

        cy.get(".ProductCarouselHarness").should("not.exist");
        cy.get(".ProductCarouselHarness__itemCard").should("not.exist");
        screenshotStep("product-carousel-empty");
    });
});
