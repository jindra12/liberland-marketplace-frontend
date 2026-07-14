import { SORT_CONTENT_BY_STORAGE_KEY } from "../../src/components/SortContentBySelect/constants";
import { mountMainHome, seedNsfwConsent } from "../support/component-tests/utils";

const openMobileDrawer = () => {
    cy.get('button[aria-label="Open navigation"]').click({ force: true });
};

const openDesktopDrawer = () => {
    cy.get('button[aria-label="Open menu"]').click({ force: true });
};

const assertSelectedSort = (value: string) => {
    cy.get(".AppHeader__sortControl .ant-select-selection-item").should("have.text", value);
};

const selectSortOption = (value: string) => {
    cy.get(".AppHeader__sortControl .ant-select").click();
    cy.contains(".ant-select-dropdown .ant-select-item-option-content", value).click({ force: true });
};

const closeOpenDrawer = (drawerSelector: string) => {
    cy.get(drawerSelector).find(".ant-drawer-close").click();
};

describe("drawer sort control", () => {
    beforeEach(() => {
        cy.window().then((win) => {
            win.localStorage.removeItem(SORT_CONTENT_BY_STORAGE_KEY);
        });
    });

    it("keeps the selected sort in the desktop drawer", () => {
        cy.viewport(1440, 1200);
        mountMainHome(seedNsfwConsent);

        openDesktopDrawer();
        cy.get(".AppHeader__desktopDrawer").should("be.visible");
        cy.contains(".AppHeader__desktopDrawer .AppHeader__sortLabel", "Sort content by").should("be.visible");
        assertSelectedSort("Hot");

        selectSortOption("Top");
        assertSelectedSort("Top");

        cy.window().then((win) => {
            expect(win.localStorage.getItem(SORT_CONTENT_BY_STORAGE_KEY)).to.equal("\"-likeCount\"");
        });

        closeOpenDrawer(".AppHeader__desktopDrawer");
        openDesktopDrawer();
        assertSelectedSort("Top");
    });

    it("keeps the selected sort in the mobile drawer", () => {
        cy.viewport(390, 844);
        mountMainHome(seedNsfwConsent);

        openMobileDrawer();
        cy.get(".AppHeader__drawer").should("be.visible");
        cy.contains(".AppHeader__drawer .AppHeader__sortLabel", "Sort content by").should("be.visible");
        assertSelectedSort("Hot");

        selectSortOption("New");
        assertSelectedSort("New");

        cy.window().then((win) => {
            expect(win.localStorage.getItem(SORT_CONTENT_BY_STORAGE_KEY)).to.equal("\"-createdAt\"");
        });

        closeOpenDrawer(".AppHeader__drawer");
        openMobileDrawer();
        assertSelectedSort("New");
    });
});
