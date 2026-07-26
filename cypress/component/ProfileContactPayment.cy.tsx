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

        const replaceInputValue = (selector: string, value: string) => {
            cy.get(selector).click().clear({ force: true }).should("have.value", "").type(value, { force: true });
        };

        cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
            replaceInputValue('input[placeholder="Phone number"]', editedPhone);
            cy.contains(".ant-form-item", "Address line 1")
                .find("input")
                .click()
                .clear({ force: true })
                .should("have.value", "")
                .type(editedAddressLine1, { force: true });

            cy.get(".Profile__walletRow").first().within(() => {
                replaceInputValue('input[placeholder="Enter wallet address"]', editedWalletAddress);
            });

            cy.contains("button", "Save Contact Information").click();
        });

        cy.wait("@updateUserById");
        cy.wait("@profileMeUser");
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
