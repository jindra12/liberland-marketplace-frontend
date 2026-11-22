import { Route, Routes } from "react-router-dom";

import CompanyDetail from "../../src/components/detail/CompanyDetail";
import { Company_CryptoAddresses_Chain } from "../../src/generated/graphql";
import { MAIN_SERVER_URL, detailRoute } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";
import { companies } from "../support/graphqlMock/fixtures/companies";
import { jobs } from "../support/graphqlMock/fixtures/jobs";
import { collection } from "../support/graphqlMock/fixtures/shared";
import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";

const company = {
    ...companies[0],
    acceptThirdwebDonations: true,
    canAcceptThirdwebDonations: true,
    cryptoAddresses: {
        chain: Company_CryptoAddresses_Chain.Ethereum,
        address: "0x1111111111111111111111111111111111111111",
    },
};

describe("Company detail donations", () => {
    beforeEach(() => {
        cy.viewport(1200, 1000);
        interceptGraphQLOperation("CompanyById", (request) => {
            request.reply({ data: { Company: company } });
        }).as("companyDetail");
        interceptGraphQLOperation("ListJobsByCompany", (request) => {
            request.reply({
                data: { Jobs: collection(jobs.filter((job) => job.company?.id === company.id)) },
            });
        });
    });

    it("shows Donate within the complete company detail on desktop and mobile", () => {
        mountWithProviders(
            <Routes>
                <Route path="/companies/:id/:serverUrl" element={<CompanyDetail />} />
            </Routes>,
            { route: detailRoute("/companies", company.id) },
        );
        cy.wait("@companyDetail");
        cy.contains("h1", "Harbor Labs").should("be.visible");
        cy.contains("Distributed shipping and tooling").should("be.visible");
        cy.contains('[role="tab"]', "Overview").should("have.attr", "aria-selected", "true");
        cy.get(".EntityDetail__tabs > .ant-tabs-nav").should(($nav) => {
            const description = Cypress.$(".CompanyOverview .Markdown")[0].getBoundingClientRect();
            expect($nav[0].getBoundingClientRect().bottom).to.be.lessThan(description.top);
        });
        cy.get(".CompanyOverview__contacts").should("contain.text", "hello@harbor.example");
        cy.get(".CompanyOverviewListings")
            .contains('[role="tab"]', "Products / Services")
            .should("have.attr", "aria-selected", "true");
        cy.get(".CompanyOverviewListings").contains("Solar Widget").should("be.visible");
        cy.get(".CompanyOverviewListings").contains("Dockmaster").should("not.exist");
        cy.get(".CompanyDetail__header")
            .contains("a", "Donate")
            .should("be.visible")
            .invoke("attr", "href")
            .then((href) => {
                const link = new URL(href!);
                expect(link.pathname).to.equal("/pay");
                expect(link.searchParams.get("companyId")).to.equal(company.id);
                expect(link.searchParams.get("serverUrl")).to.equal(MAIN_SERVER_URL);
            });
        [
            { width: 1200, height: 1000, name: "desktop" },
            { width: 390, height: 844, name: "mobile" },
        ].forEach((viewport) => {
            cy.viewport(viewport.width, viewport.height);
            cy.get(".EntityDetail__headerBody").should(($body) => {
                const badges = $body.find(".CompanyDetail__identityRow")[0].getBoundingClientRect();
                const donate = $body.find("a.ant-btn")[0].getBoundingClientRect();
                expect(donate.top).to.be.greaterThan(badges.bottom);
                expect(donate.left).to.be.closeTo(badges.left, 1);
                expect(donate.width).to.be.lessThan($body[0].getBoundingClientRect().width);
            });
            cy.get(".CompanyDetail__header").contains("a", "Donate").should("be.visible");
            cy.get(".CompanyOverviewListings .ant-tabs-tabpane-active .ant-list-item").should("have.length", 3);
            cy.document().then(async (document) => {
                await document.fonts.ready;
            });
            cy.document().then((document) =>
                expect(document.documentElement.scrollWidth).to.be.at.most(viewport.width),
            );
            screenshotStep(`company-detail-donate-${viewport.name}`);
            cy.get(".CompanyOverviewListings").contains('[role="tab"]', "Jobs (").click();
            cy.get(".CompanyOverviewListings .ant-tabs-tabpane-active").contains("Dockmaster").should("be.visible");
            cy.get(".CompanyOverviewListings .ant-tabs-tabpane-active").contains("Solar Widget").should("not.exist");
            screenshotStep(`company-overview-jobs-${viewport.name}`);
            cy.get(".CompanyOverviewListings").contains('[role="tab"]', "Products / Services").click();
        });
    });

    [390, 1200].forEach((width) => {
        it(`keeps company navigation independent of preview tabs at ${width}px`, () => {
            cy.viewport(width, 1000);
            mountWithProviders(
                <Routes>
                    <Route path="/companies/:id/:serverUrl" element={<CompanyDetail />} />
                </Routes>,
                { route: detailRoute("/companies", company.id) },
            );
            cy.get(".CompanyOverviewListings").contains('[role="tab"]', "Jobs (").click();
            cy.get(".CompanyOverviewListings .ant-tabs-tabpane-active").contains("Dockmaster").should("be.visible");
            cy.get(".CompanyOverviewListings").contains('[role="tab"]', "Products / Services").click();
            cy.get(".CompanyOverviewListings .ant-tabs-tabpane-active").contains("Solar Widget").should("be.visible");
            // Keep rc-tabs' horizontal scroll unchanged when focusing an overflow tab.
            cy.get(".EntityDetail__tabs > .ant-tabs-nav").scrollIntoView();
            cy.contains('.EntityDetail__tabs > .ant-tabs-nav [role="tab"]', "Jobs (")
                .click({ scrollBehavior: false })
                .should("have.attr", "aria-selected", "true");
            cy.get(
                ".EntityDetail__tabs > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane-active > .infinite-scroll-component__outerdiv",
            )
                .contains("Dockmaster")
                .should("be.visible");
            cy.contains('.EntityDetail__tabs > .ant-tabs-nav [role="tab"]', "Overview").click();
            cy.get(".CompanyOverview__contacts").should("be.visible");
        });
    });

    it("keeps the company readable without Donate when payment setup is incomplete", () => {
        interceptGraphQLOperation("CompanyById", (request) => {
            request.reply({
                data: { Company: { ...company, cryptoAddresses: null, canAcceptThirdwebDonations: false } },
            });
        }).as("unconfiguredCompany");
        mountWithProviders(
            <Routes>
                <Route path="/companies/:id/:serverUrl" element={<CompanyDetail />} />
            </Routes>,
            { route: detailRoute("/companies", company.id) },
        );
        cy.wait("@unconfiguredCompany");
        cy.contains("h1", "Harbor Labs").should("be.visible");
        cy.get(".CompanyOverviewListings").contains("Solar Widget").should("be.visible");
        cy.contains("a", "Donate").should("not.exist");
        screenshotStep("company-detail-donations-unavailable");
    });

    it("opens Jobs when the company has no products", () => {
        interceptGraphQLOperation("ListProductsByCompany", (request) => {
            request.reply({ data: { Products: collection([]) } });
        });
        mountWithProviders(
            <Routes>
                <Route path="/companies/:id/:serverUrl" element={<CompanyDetail />} />
            </Routes>,
            { route: detailRoute("/companies", company.id) },
        );
        cy.get(".CompanyOverviewListings")
            .contains('[role="tab"]', "Jobs (")
            .should("have.attr", "aria-selected", "true");
        cy.get(".CompanyOverviewListings").contains('[role="tab"]', "Products / Services").should("not.exist");
        cy.get(".CompanyOverviewListings").contains("Dockmaster").should("be.visible");
        screenshotStep("company-overview-jobs-only");
    });

    it("omits the preview tabs when neither collection has records", () => {
        interceptGraphQLOperation("ListProductsByCompany", (request) => {
            request.reply({ data: { Products: collection([]) } });
        }).as("emptyProducts");
        interceptGraphQLOperation("ListJobsByCompany", (request) => {
            request.reply({ data: { Jobs: collection([]) } });
        }).as("emptyJobs");
        mountWithProviders(
            <Routes>
                <Route path="/companies/:id/:serverUrl" element={<CompanyDetail />} />
            </Routes>,
            { route: detailRoute("/companies", company.id) },
        );
        cy.wait(["@emptyProducts", "@emptyJobs"]);
        cy.get(".CompanyOverview__contacts").should("be.visible");
        cy.get(".CompanyOverviewListings").should("not.exist");
    });
});
