import { mountProfileContent, assertNicknameValue, assertPasswordFormIsEmpty } from "./profile/shared";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { buildDefaultAuthContext } from "../support/component-tests/mount";

describe("profile nickname", () => {
    it("prefills nickname and leaves password fields empty", () => {
        mountProfileContent();
        assertNicknameValue("Nova Rivers");
        assertPasswordFormIsEmpty();
    });

    it("keeps nickname edits after saving", () => {
        mountProfileContent();
        const editedName = "Nova Rivers Edited";

        cy.contains(".Profile__card", "Change Nickname").within(() => {
            cy.get("input").click().clear({ force: true }).should("have.value", "").type(editedName, { force: true });
            cy.contains("button", "Update").click();
        });

        cy.wait("@updateUserById");
        cy.wait("@profileMeUser");
        assertNicknameValue(editedName);
    });

    it("keeps saving pending until OAuth rotation and account refresh finish", () => {
        const refresh = { finish: () => {} };
        const pending = new Cypress.Promise<void>((resolve) => {
            refresh.finish = resolve;
        });
        const auth = buildDefaultAuthContext();
        const signinSilent = cy.stub().callsFake(async () => {
            await pending;
            return auth.signinSilent();
        }).as("refreshIdentity");
        mountProfileContent([MAIN_SERVER_URL], signinSilent);
        const editedName = "Nova Rivers Refreshed";
        cy.get(".Profile__nicknameCard input").clear().type(editedName);
        cy.contains(".Profile__nicknameCard button", "Update").click();
        cy.wait("@updateUserById");
        cy.get("@refreshIdentity").should("have.been.calledOnce");
        cy.contains(".Profile__nicknameCard button", "Update").should("have.class", "ant-btn-loading");
        cy.get(".Profile__nicknameCard").screenshot("nickname-waits-for-oauth-refresh");
        cy.contains(".Profile__nicknameCard button", "Update").should("have.class", "ant-btn-loading");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            if (req.body.query?.includes("query MeUser")) {
                req.alias = "accountAfterRotation";
            }
        });
        cy.then(() => refresh.finish());
        cy.wait(["@accountAfterRotation", "@accountAfterRotation"]);
        cy.contains(".Profile__nicknameCard button", "Update").should("not.have.class", "ant-btn-loading");
        assertNicknameValue(editedName);
    });
});
