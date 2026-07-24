import { mountProfileContent, assertProfileCoopDefaults } from "./profile/shared";

describe("profile server switch", () => {
    beforeEach(() => {
        mountProfileContent();
    });

    it("refreshes the form defaults when the selected server changes to COOP", () => {
        cy.get(".Profile__serverCard").should("be.visible").find(".ant-select-selector").should("be.visible").click({ force: true });
        cy.contains(".ant-select-item-option-content", "Co-op (127.0.0.1)").click({ force: true });

        cy.contains(".Profile__serverCard", "Co-op").should("be.visible");
        assertProfileCoopDefaults();
    });
});
