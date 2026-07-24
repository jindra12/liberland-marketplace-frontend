import { mountProfileContent, assertNicknameValue, assertPasswordFormIsEmpty } from "./profile/shared";

describe("profile nickname", () => {
    beforeEach(() => {
        mountProfileContent();
    });

    it("prefills nickname and leaves password fields empty", () => {
        assertNicknameValue("Nova Rivers");
        assertPasswordFormIsEmpty();
    });

    it("keeps nickname edits after saving", () => {
        const editedName = "Nova Rivers Edited";

        cy.contains(".Profile__card", "Change Nickname").within(() => {
            cy.get("input").clear({ force: true }).type(editedName, { force: true });
            cy.contains("button", "Update").click();
        });

        cy.wait("@updateUserById");
        cy.contains("Nickname updated").should("be.visible");
        assertNicknameValue(editedName);
    });
});
