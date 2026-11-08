import React from "react";
import { mount } from "cypress/react";
import { AccumulatedDocsProbe } from "../support/security-regressions/AccumulatedDocsProbe";

describe("Paginated document state", { retries: 0 }, () => {
    it("clears old results when a first-page search becomes empty", () => {
        mount(<AccumulatedDocsProbe docs={[{ id: "company", name: "Previous company" }]} page={1} />).then(
            (component) => {
                cy.get('[data-cy="accumulated-documents"]').should("have.text", "Previous company");
                cy.then(() => component.rerender(<AccumulatedDocsProbe docs={[]} page={1} />));
                cy.get('[data-cy="accumulated-documents"]').should("have.text", "");
            },
        );
    });

    it("replaces an already accumulated record when a later response updates it", () => {
        mount(<AccumulatedDocsProbe docs={[{ id: "company", name: "Old company name" }]} page={1} />).then(
            (component) => {
                cy.get('[data-cy="accumulated-documents"]').should("have.text", "Old company name");
                cy.then(() =>
                    component.rerender(
                        <AccumulatedDocsProbe docs={[{ id: "company", name: "Updated company name" }]} page={2} />,
                    ),
                );
                cy.get('[data-cy="accumulated-documents"]').should("have.text", "Updated company name");
            },
        );
    });
});
