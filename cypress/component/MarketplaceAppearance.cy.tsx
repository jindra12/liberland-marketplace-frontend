import AppLayout from "../../src/components/AppLayout";
import Splash from "../../src/components/Splash";
import { CompanyList } from "../../src/components/lists/CompanyList";
import { IdentityFilter } from "../../src/components/IdentityFilter";
import { SearchIdentitiesDocument } from "../../src/generated/graphql";
import { mountWithProviders, screenshotStep } from "../support/component-tests/direct";

describe("marketplace visual hierarchy", () => {
    it("distinguishes an untouched tribe search from no matches", () => {
        mountWithProviders(<IdentityFilter onChange={cy.stub()} />, { route: "/companies" });
        cy.get(".FilterControl").click();
        cy.contains("Type a tribe name to search").should("be.visible");
        cy.get(".FilterControl input").type("unmatched-tribe");
        cy.contains("No matching tribes").should("be.visible");
        screenshotStep("tribe-filter-no-matches", "viewport");
    });

    it("reports failed tribe searches instead of calling them empty results", () => {
        cy.intercept("POST", "**/api/graphql", (request) => {
            const body = request.body as { query: string };
            if (body.query === SearchIdentitiesDocument) {
                request.reply({ body: { errors: [{ message: "Tribe backend unavailable" }] } });
            }
        });
        mountWithProviders(<IdentityFilter onChange={cy.stub()} />, { route: "/companies" });
        cy.get(".FilterControl").click();
        cy.get(".FilterControl input").type("Liberland");
        cy.contains("Could not load tribes. Try searching again.").should("be.visible");
        cy.contains("No matching tribes").should("not.exist");
        screenshotStep("tribe-filter-failure", "viewport");
    });

    [390, 1280].forEach((width) => {
        it(`puts browsing and real records before promotional decoration at ${width}px`, () => {
            cy.viewport(width, 1000);
            mountWithProviders(
                <AppLayout>
                    <Splash />
                </AppLayout>,
                { route: "/" },
            );
            cy.contains("h1", "Marketplace").should("be.visible");
            cy.contains(".SplashPage__heroActions", "Search marketplace").should("be.visible");
            cy.get(".SplashPage__heroActions a").should("have.length", 5);
            cy.get(".SplashEntityCard__itemCard").should("exist");
            cy.get(".SplashEntityCard__itemCard")
                .first()
                .should(($card) => {
                    expect($card[0].getBoundingClientRect().top).to.be.lessThan(550);
                });
            cy.get(".AppLayout").should("have.css", "background-image", "none");
            cy.get(".AppHeader").should(($header) => {
                expect($header[0].getBoundingClientRect().height).to.be.at.most(70);
            });
            cy.get(".AppHeader__logo").should("have.css", "width", "30px");
            cy.get(".SplashEntityCard__inlineActions .ant-btn")
                .first()
                .should(($button) => {
                    expect($button[0].getBoundingClientRect().width).to.be.lessThan(140);
                });
            cy.contains("button", "Search marketplace")
                .focus()
                .should("have.css", "outline-style", "solid")
                .and("have.css", "background-image", "none")
                .blur();
            cy.get(".SplashPage__heroTitle").should("have.css", "text-shadow", "none");
            cy.get(".MarketAccordion__title").first().should("have.text", "Products");
            cy.get('[data-section="posts-top"] .ant-list-item').should("have.length", 3);
            cy.get(".MarketAccordion, .MarketAccordionMobile")
                .children()
                .should(($sections) => {
                    const order = $sections
                        .toArray()
                        .map((section) => section.querySelector("[data-section]")?.getAttribute("data-section"));
                    expect(order.slice(0, 7)).to.deep.equal([
                        "products",
                        "posts-top",
                        "companies",
                        "posts-firstMiddle",
                        "jobs",
                        "posts-secondMiddle",
                        "ventures",
                    ]);
                });
            cy.document().then(async (doc) => {
                await doc.fonts.ready;
                expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
            });
            screenshotStep(`homepage-${width}`, "viewport");
        });

        it(`keeps company descriptions and primary actions easy to scan at ${width}px`, () => {
            cy.viewport(width, 1000);
            mountWithProviders(
                <AppLayout>
                    <CompanyList />
                </AppLayout>,
                { route: "/companies" },
            );
            cy.get(".CompanyList__body").should("exist");
            cy.get(".ListShareDetailButtons")
                .first()
                .within(() => {
                    cy.get("a, button").first().should("contain.text", "Details");
                });
            cy.get(".CompanyList__body").first().should("not.contain.text", "Phone");
            cy.get(".InfinityScroll .ant-list-item")
                .first()
                .should(($record) => {
                    expect($record[0].getBoundingClientRect().height).to.be.lessThan(360);
                });
            cy.document().then(async (doc) => {
                await doc.fonts.ready;
                expect(doc.documentElement.scrollWidth).to.be.at.most(doc.documentElement.clientWidth);
            });
            screenshotStep(`companies-${width}`, "viewport");
        });
    });
});
