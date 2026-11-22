import { Flex } from "antd";
import { Route, Routes } from "react-router-dom";

import { CompanyCard } from "../../src/components/cards/CompanyCard";
import { JobCard } from "../../src/components/cards/JobCard";
import { ProductServiceCard } from "../../src/components/cards/ProductServiceCard";
import CompanyDetail from "../../src/components/detail/CompanyDetail";
import JobDetail from "../../src/components/detail/JobDetail";
import ProductServiceDetail from "../../src/components/detail/ProductServiceDetail";
import { CompanyList } from "../../src/components/lists/CompanyList";
import { JobList } from "../../src/components/lists/JobList";
import { ProductsServicesList } from "../../src/components/lists/ProductServiceList";
import { EntityDescription } from "../../src/components/shared/EntityDescription";
import { COOP_SERVER_URL, detailRoute } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/direct";
import { products } from "../support/graphqlMock/fixtures/catalog";
import { companies } from "../support/graphqlMock/fixtures/companies";
import { jobs } from "../support/graphqlMock/fixtures/jobs";
import { collection } from "../support/graphqlMock/fixtures/shared";
import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";

describe("source-qualified entity links and tribe affiliation", () => {
    beforeEach(() => {
        interceptGraphQLOperation("CompanyById", (request) => {
            request.reply({ data: { Company: companies[0] } });
        }).as("companyRecord");
        interceptGraphQLOperation("JobById", (request) => {
            request.reply({ data: { Job: jobs[0] } });
        });
        interceptGraphQLOperation("ProductById", (request) => {
            request.reply({ data: { Product: products[0] } });
        });
        interceptGraphQLOperation("ListProductsByCompany", (request) => {
            expect(new URL(request.url).origin).to.equal(COOP_SERVER_URL);
            request.reply({
                data: { Products: collection(products.filter((product) => product.company?.id === companies[0].id)) },
            });
        }).as("companyProducts");
        interceptGraphQLOperation("ListJobsByCompany", (request) => {
            request.reply({ data: { Jobs: collection(jobs.filter((job) => job.company?.id === companies[0].id)) } });
        });
    });

    [390, 1200].forEach((width) => {
        [
            { section: "/companies", entity: companies[0], component: <CompanyDetail />, title: companies[0].name },
            { section: "/jobs", entity: jobs[0], component: <JobDetail />, title: jobs[0].title },
            {
                section: "/products-services",
                entity: products[0],
                component: <ProductServiceDetail />,
                title: products[0].name,
            },
        ].forEach((example) => {
            it(`preserves the requested backend and places the tribe below the ${example.section.slice(1)} description at ${width}px`, () => {
                cy.viewport(width, 1000);
                mountWithProviders(
                    <Routes>
                        <Route path={`${example.section}/:id/:serverUrl`} element={example.component} />
                    </Routes>,
                    { route: detailRoute(example.section, example.entity.id, COOP_SERVER_URL) },
                );
                cy.contains("h1", example.title!).should("be.visible");
                cy.get(".EntityDescription")
                    .first()
                    .scrollIntoView()
                    .within(() => {
                        cy.get(".Markdown").should("contain.text", example.entity.description!);
                        cy.get(".EntityDescription__tribe a")
                            .should("contain.text", companies[0].identity!.name!)
                            .and(
                                "have.attr",
                                "href",
                                detailRoute("/tribes", companies[0].identity!.id, COOP_SERVER_URL),
                            );
                        cy.get(".EntityDescription__tribe").should(($tribe) => {
                            const description = $tribe.parent().find(".Markdown")[0].getBoundingClientRect();
                            expect($tribe[0].getBoundingClientRect().top).to.be.at.least(description.bottom);
                        });
                    });
                if (example.section !== "/companies") {
                    cy.get(".ProductDetail__summary, .JobDetail__summary")
                        .contains("a", companies[0].name!)
                        .should("have.attr", "href", detailRoute("/companies", companies[0].id, COOP_SERVER_URL));
                }
                if (example.section === "/products-services") {
                    cy.wait("@companyRecord");
                    cy.wait("@companyProducts");
                    cy.contains("h4", "Related products").should("be.visible");
                    cy.contains(".SplashEntityCard__itemLink", "Sun Panel").should("exist");
                    cy.contains("a", "View company").should(
                        "have.attr",
                        "href",
                        detailRoute("/companies", companies[0].id, COOP_SERVER_URL),
                    );
                }
                if (example.section === "/companies") {
                    cy.wait("@companyProducts");
                    cy.get(".CompanyOverviewListings").contains("Solar Widget").should("be.visible");
                }
                cy.get(
                    'a[href^="/tribes/"], a[href^="/companies/"], a[href^="/products-services/"], a[href^="/jobs/"]',
                ).each(($link) => {
                    expect($link.attr("href")).to.match(
                        new RegExp(`/${Cypress.Buffer.from(COOP_SERVER_URL).toString("hex")}$`),
                    );
                });
                cy.document().then((document) => {
                    expect(document.documentElement.scrollWidth).to.be.at.most(width);
                });
                cy.document().then(async (document) => {
                    await document.fonts.ready;
                });
                cy.get("h1").scrollIntoView();
                screenshotStep(`${example.section.slice(1)}-tribe-${width}`);
            });
        });

        it(`shows descriptions followed by tribe links on all three card families at ${width}px`, () => {
            cy.viewport(width, 1200);
            mountWithProviders(
                <Flex vertical gap={24}>
                    <CompanyCard items={[companies[0]]} />
                    <JobCard items={[jobs[0]]} />
                    <ProductServiceCard items={[products[0]]} />
                </Flex>,
            );
            cy.get(".EntityDescription")
                .should("have.length", 3)
                .each(($description) => {
                    const markdown = $description.find(".Markdown")[0].getBoundingClientRect();
                    const tribe = $description.find(".EntityDescription__tribe")[0].getBoundingClientRect();
                    expect(tribe.top).to.be.at.least(markdown.bottom);
                    expect($description.find("a").attr("href")).to.equal(
                        detailRoute("/tribes", companies[0].identity!.id),
                    );
                });
            screenshotStep(`entity-cards-tribes-${width}`);
        });
    });

    [
        { label: "companies", component: <CompanyList /> },
        { label: "jobs", component: <JobList /> },
        { label: "products", component: <ProductsServicesList /> },
    ].forEach((example) => {
        it(`keeps the tribe below the description in the ${example.label} listing`, () => {
            cy.viewport(1200, 900);
            mountWithProviders(example.component);
            cy.get(".EntityDescription")
                .first()
                .within(() => {
                    cy.get(".Markdown").should("not.be.empty");
                    cy.get(".EntityDescription__tribe a")
                        .should("contain.text", companies[0].identity!.name!)
                        .and("have.attr", "href", detailRoute("/tribes", companies[0].identity!.id));
                });
            if (example.label === "jobs") {
                cy.get(".JobList__body")
                    .first()
                    .contains("a", companies[0].name!)
                    .should("have.attr", "href", detailRoute("/companies", companies[0].id));
            }
        });
    });

    it("does not infer an affiliation from access restrictions or create a link without a source", () => {
        mountWithProviders(
            <Flex vertical gap={16}>
                <EntityDescription
                    description={companies[3].description}
                    identity={companies[3].identity}
                    serverURL={COOP_SERVER_URL}
                />
                <EntityDescription
                    description="A known tribe without source information"
                    identity={{ id: "tribe", name: "Known tribe" }}
                />
            </Flex>,
        );
        cy.get(".EntityDescription")
            .first()
            .should("contain.text", "Not specified")
            .and("not.contain.text", companies[3].allowedIdentities![0].name!);
        cy.get(".EntityDescription").last().should("contain.text", "Known tribe");
        cy.get(".EntityDescription a").should("not.exist");
    });
});
