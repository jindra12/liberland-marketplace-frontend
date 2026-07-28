import * as React from "react";

import { mount } from "cypress/react";

import { MarkdownEditor } from "../../src/components/publish/MarkdownEditor";

import { screenshotStep } from "../support/component-tests/utils";

const sampleMarkdown = `# Harbor Preview

This editor should feel like part of the dark app.

- clean textarea styling
- softer preview surfaces
- stronger contrast for readability

> The preview should feel intentional, not default.

Here is \`inline code\` and a [link](https://example.com).

\`\`\`ts
const message = "hello";
\`\`\`
`;

const MarkdownEditorHarness: React.FunctionComponent = () => {
    return <MarkdownEditor rows={12} value={sampleMarkdown} />;
};

const hidePageScrollbars = () => {
    cy.document().then((doc) => {
        doc.documentElement.style.overflow = "hidden";
        doc.body.style.overflow = "hidden";
    });
};

describe("markdown editor", () => {
    const openPreviewMode = () => {
        cy.get(".w-md-editor-toolbar [aria-label^='Preview code']").click({ force: true });
        cy.get(".w-md-editor-preview").should("be.visible");
    };

    it("renders the editor on desktop", () => {
        cy.viewport(1440, 1200);
        hidePageScrollbars();
        mount(<MarkdownEditorHarness />);
        cy.get(".MarkdownEditor").should("be.visible");
        cy.get(".w-md-editor").should("be.visible");
        cy.get(".w-md-editor-text-input").should("be.visible");
        screenshotStep("markdown-editor-desktop-edit", "viewport");
        openPreviewMode();
        screenshotStep("markdown-editor-desktop-preview", "viewport");
    });

    it("renders the editor on mobile", () => {
        cy.viewport(390, 844);
        hidePageScrollbars();
        mount(<MarkdownEditorHarness />);
        cy.get(".MarkdownEditor").should("be.visible");
        cy.get(".w-md-editor").should("be.visible");
        cy.get(".w-md-editor-text-input").should("be.visible");
        screenshotStep("markdown-editor-mobile-edit", "viewport");
        openPreviewMode();
        screenshotStep("markdown-editor-mobile-preview", "viewport");
    });
});
