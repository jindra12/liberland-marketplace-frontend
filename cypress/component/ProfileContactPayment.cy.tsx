import { mountProfileContent, assertProfileMainDefaults } from "./profile/shared";

describe("profile contact payment", () => {
    beforeEach(() => {
        mountProfileContent();
    });

    it("prefills contact and wallet defaults", () => {
        assertProfileMainDefaults();
    });

    it("keeps contact and wallet edits after saving", () => {
        const editedPhone = "+1 555 9999";
        const editedAddressLine1 = "99 Updated Road";
        const editedWalletAddress = "SoUserWallet9999";

        cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
            cy.get('input[placeholder="Phone number"]').clear({ force: true }).type(editedPhone, { force: true });
            cy.contains(".ant-form-item", "Address line 1")
                .find("input")
                .clear({ force: true })
                .type(editedAddressLine1, { force: true });

            cy.get(".Profile__walletRow").first().within(() => {
                cy.get('input[placeholder="Enter wallet address"]')
                    .clear({ force: true })
                    .type(editedWalletAddress, { force: true });
            });

            cy.contains("button", "Save Contact Information").click();
        });

        cy.wait("@updateUserById");
        cy.contains("Contact information updated").should("be.visible");

        cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
            cy.get('input[placeholder="Phone number"]').should("have.value", editedPhone);
            cy.contains(".ant-form-item", "Address line 1").find("input").should("have.value", editedAddressLine1);
            cy.get(".Profile__walletRow").first().within(() => {
                cy.get('input[placeholder="Enter wallet address"]').should("have.value", editedWalletAddress);
            });
        });
    });
});
