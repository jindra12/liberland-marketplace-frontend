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
        cy.contains("Dockmaster").should("be.visible");
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
            cy.contains("Dockmaster").should("be.visible");
            cy.document().then((document) =>
                expect(document.documentElement.scrollWidth).to.be.at.most(viewport.width),
            );
            screenshotStep(`company-detail-donate-${viewport.name}`);
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
        cy.contains("Dockmaster").should("be.visible");
        cy.contains("a", "Donate").should("not.exist");
        screenshotStep("company-detail-donations-unavailable");
    });
});
