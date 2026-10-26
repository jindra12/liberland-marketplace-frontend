import React from "react";
import { mount } from "cypress/react";
import { AntProvider } from "../../src/components/AntProvider";
import { PublicContent } from "../../src/aiDiscovery/PublicContent";
import fixture from "../fixtures/publicDiscovery.json";

describe("HTTP-only marketplace discovery", () => {
    it("finds a real Liberland web developer from the guide through JSON and visible server HTML", () => {
        cy.task("publicDiscoveryWorkflow").should("equal", true);
        cy.task<string>("publicDiscoveryMarkup").then((html) => {
            const document = new DOMParser().parseFromString(html, "text/html");
            document.querySelectorAll("script").forEach((script) => script.remove());
            expect(document.body.textContent).to.include("website development");
            const profile = Array.from(document.querySelectorAll("a")).find(
                (link) => link.textContent === fixture.company.name,
            );
            expect(profile?.href).to.include(`/companies/${fixture.company.id}/`);
            expect(profile?.closest('[aria-hidden="true"], [hidden], .screen-reader-only')).to.equal(null);
        });
    });

    it("distinguishes empty results, invalid requests, missing tribes and backend failures", () => {
        cy.task("publicDiscoveryErrors").should("equal", true);
    });

    it("identifies a company through actual related services, not an unrelated tribe mention", () => {
        cy.task("publicDiscoveryServiceEvidence").should("equal", true);
    });

    it("removes the fallback after hydration so the normal SPA is not duplicated", () => {
        mount(
            <AntProvider>
                <PublicContent content={{ title: "Server fallback", description: "", items: [], links: [] }} />
            </AntProvider>,
        );
        cy.get('[aria-label="Marketplace listings"]').should("not.exist");
    });

    it("preserves source, filters and representation in pagination without breaking JSON-LD", () => {
        cy.task("publicDiscoveryPagination").should("equal", true);
    });

    it("keeps the readable view visible and linked without mounting the SPA or routes", () => {
        mount(
            <AntProvider>
                <PublicContent
                    readableOnly
                    content={{
                        title: "Liberland companies",
                        description: "Primary tribe affiliation, not incorporation.",
                        items: [
                            {
                                name: fixture.company.name,
                                description: fixture.company.description,
                                url: `/companies/${fixture.company.id}/source`,
                                affiliation: { name: fixture.tribe.name, url: `/tribes/${fixture.tribe.id}/source` },
                            },
                        ],
                        links: [{ name: "Next page", url: "/companies?tribe=Liberland&page=2" }],
                    }}
                />
            </AntProvider>,
        );
        cy.contains("a", fixture.company.name)
            .should("be.visible")
            .and("have.attr", "href", `/companies/${fixture.company.id}/source`);
        cy.contains("website development").should("be.visible");
        cy.contains("Tribe affiliation:").should("be.visible");
        cy.contains("a", "Next page").should("have.attr", "href").and("include", "format=html");
        cy.screenshot("Readable-Liberland-company-directory");
    });
});
