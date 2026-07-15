import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountProfileRoute, screenshotStep, waitForMeUserQuery } from "../support/component-tests/utils";

const assertNicknameValue = (value: string) => {
    cy.get(".Profile__nicknameCard input").should("have.value", value);
};

const assertPasswordFormIsEmpty = () => {
    cy.contains(".Profile__card", "Change Password").within(() => {
        cy.get('input[type="password"]').should("have.length", 3);
        cy.get('input[type="password"]').each((input) => {
            expect(input).to.have.value("");
        });
    });
};

const assertFormItemValue = (label: string, value: string) => {
    cy.contains(".ant-form-item", label).find("input").should("have.value", value);
};

const assertWalletRow = (index: number, chain: string, provider: string, address: string) => {
    cy.get(".Profile__walletRow").eq(index).within(() => {
        cy.get(".ant-select-selection-item").should("contain.text", chain);
        cy.get('input[placeholder="Select a wallet"]').should("have.value", provider);
        cy.get('input[placeholder="Enter wallet address"]').should("have.value", address);
    });
};

const assertMainDefaults = () => {
    assertNicknameValue("Nova Rivers");
    assertPasswordFormIsEmpty();

    cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
        cy.get('input[placeholder="Phone number"]').should("have.value", "+1 555 0001");
        assertFormItemValue("Address line 1", "1 Dockside Road");
        assertFormItemValue("Address line 2", "Apt 12");
        assertFormItemValue("City", "Port Sol");
        assertFormItemValue("State / Region", "Coast");
        assertFormItemValue("Postal code", "11001");
        assertFormItemValue("Country", "Liberland");
    });

    cy.get(".Profile__walletRow").should("have.length", 3);
    assertWalletRow(0, "Solana", "phantom", "SoUserWallet1717");
    assertWalletRow(1, "Ethereum", "metamask", "0xUserWallet1818");
    assertWalletRow(2, "Tron", "TronLink Stub", "TUserWallet1919");
};

const assertCoopDefaults = () => {
    assertNicknameValue("Iris Shore");
    assertPasswordFormIsEmpty();

    cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
        cy.get('input[placeholder="Phone number"]').should("have.value", "+1 555 0600");
        assertFormItemValue("Address line 1", "8 Dockside Lane");
        assertFormItemValue("Address line 2", "Unit 3");
        assertFormItemValue("City", "North Port");
        assertFormItemValue("State / Region", "Coast");
        assertFormItemValue("Postal code", "22001");
        assertFormItemValue("Country", "Liberland");
    });

    cy.get(".Profile__walletRow").should("have.length", 1);
    assertWalletRow(0, "Solana", "phantom", "SoCoopWallet606");
};

const openServerSelect = () => {
    cy.get(".Profile__serverCard").should("be.visible").find(".ant-select-selector").should("be.visible").click({ force: true });
};

const selectProfileServer = (label: string) => {
    openServerSelect();
    cy.contains(".ant-select-item-option-content", label).click();
};

const assertFreshMeUserName = (serverUrl: string, expectedName: string) => {
    cy.window().then(async (win) => {
        const tokenKey = `oidc.user:${serverUrl}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;
        const serializedUser = win.localStorage.getItem(tokenKey);
        const accessToken = serializedUser ? JSON.parse(serializedUser).access_token : undefined;
        const response = await win.fetch(`${serverUrl}/api/graphql`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify({
                query: `query MeUser {
                    meUser {
                        user {
                            name
                        }
                    }
                }`,
            }),
        });
        const body = (await response.json()) as {
            data?: {
                meUser?: {
                    user?: {
                        name?: string | null;
                    } | null;
                } | null;
            };
        };

        expect(response.status).to.equal(200);
        expect(body.data?.meUser?.user?.name).to.equal(expectedName);
    });
};

describe("profile", () => {
    beforeEach(() => {
        mountProfileRoute([MAIN_SERVER_URL, COOP_SERVER_URL]);
        waitForMeUserQuery(MAIN_SERVER_URL, "Nova Rivers");
    });

    it("prefills every form from the main server me query", () => {
        assertMainDefaults();
    });

    it("refreshes the form defaults when the selected server changes to COOP", () => {
        selectProfileServer("Co-op (127.0.0.1)");

        screenshotStep("profile-coop-selected");
        assertCoopDefaults();
    });

    it("keeps nickname edits after saving and refreshing", () => {
        const editedName = "Nova Rivers Edited";

        cy.contains(".Profile__card", "Change Nickname").within(() => {
            cy.get("input").clear().type(editedName);
            cy.contains("button", "Update").click();
        });

        assertFreshMeUserName(MAIN_SERVER_URL, editedName);

        screenshotStep("profile-nickname-saved");
        assertNicknameValue(editedName);
    });

    it("keeps contact and wallet edits after saving and refreshing", () => {
        const editedPhone = "+1 555 9999";
        const editedAddressLine1 = "99 Updated Road";
        const editedWalletAddress = "SoUserWallet9999";

        cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
            cy.get('input[placeholder="Phone number"]').clear().type(editedPhone);
            cy.contains(".ant-form-item", "Address line 1").find("input").clear().type(editedAddressLine1);

            cy.get(".Profile__walletRow").first().within(() => {
                cy.get('input[placeholder="Enter wallet address"]').clear().type(editedWalletAddress);
            });

            cy.contains("button", "Save Contact Information").click();
        });

        assertFreshMeUserName(MAIN_SERVER_URL, "Nova Rivers");
        screenshotStep("profile-contact-and-wallet-saved");

        cy.contains(".Profile__contactCard", "Contact & Payment").within(() => {
            cy.get('input[placeholder="Phone number"]').should("have.value", editedPhone);
            assertFormItemValue("Address line 1", editedAddressLine1);
            cy.get(".Profile__walletRow").first().within(() => {
                cy.get('input[placeholder="Enter wallet address"]').should("have.value", editedWalletAddress);
            });
        });
    });
});
