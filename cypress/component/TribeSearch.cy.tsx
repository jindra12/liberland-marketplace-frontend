import React from "react";
import { Typography } from "antd";
import { mount } from "cypress/react";
import { AntProvider } from "../../src/components/AntProvider";
import { DiscoveryGuide } from "../../src/aiDiscovery/DiscoveryGuide";

describe("public tribe discovery", () => {
    it("server-renders a working discovery guide without adding visible UI", () => {
        cy.task("aiDiscoverySsr").should("equal", true);
        mount(
            <AntProvider>
                <DiscoveryGuide />
                <Typography.Paragraph>Interactive marketplace content remains unchanged.</Typography.Paragraph>
            </AntProvider>,
        );
        cy.get('[aria-label="Marketplace data and navigation"]').should((guide) => {
            expect(guide).to.have.class("screen-reader-only");
            expect(guide).to.have.css("position", "absolute");
            expect(guide).to.have.css("width", "1px");
            expect(guide).to.have.css("height", "1px");
            expect(guide).to.have.css("overflow", "hidden");
            expect(guide).not.to.have.attr("hidden");
            expect(guide).to.have.attr("aria-hidden", "true");
        });
        cy.get(".screen-reader-only a").each((link) => {
            expect(link).to.have.attr("tabindex", "-1");
        });
        cy.get('.screen-reader-only a[href="/llms.txt"]').should("have.text", "Marketplace search and navigation guide. ");
        cy.contains("Interactive marketplace content remains unchanged.").should("be.visible");
        cy.screenshot("SSR-discovery-guide-does-not-change-visible-UI");
    });

    it("exposes real listing results, counts and previous/next pages within JSON-LD", () => {
        cy.task("aiDiscoveryPagination").should("equal", true);
    });

    it("reuses generated affiliation queries and preserves filters throughout JSON-LD pagination", () => {
        cy.task("tribeSearchGraphql").should("equal", true);
    });

    it("rejects ambiguous, missing, invalid, and private-source lookups without leaking unfiltered listings", () => {
        cy.task("tribeSearchSafety").should("equal", true);
    });

    it("advertises public GET search and complete collections through home, listing, and tribe metadata", () => {
        cy.task("tribeSearchDiscovery").should("equal", true);
    });

    it("supports anonymous MCP affiliation search through backend MCPs for all three entities", () => {
        cy.task("tribeSearchMcp").should("equal", true);
    });
});
