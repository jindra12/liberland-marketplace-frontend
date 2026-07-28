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
            cy.get("input").click().clear({ force: true }).should("have.value", "").type(editedName, { force: true });
            cy.contains("button", "Update").click();
        });

        cy.wait("@updateUserById");
        cy.wait("@profileMeUser");
        assertNicknameValue(editedName);
    });
});
