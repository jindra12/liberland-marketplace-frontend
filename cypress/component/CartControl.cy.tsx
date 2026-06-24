import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAuthenticatedCartRoute } from "../support/component-tests/utils";
import { NSFW_CONSENT_STORAGE_KEY } from "../../src/components/endpoints/constants";

const mountCartControl = () => {
    mountAuthenticatedCartRoute("/cart", [MAIN_SERVER_URL], {
        [MAIN_SERVER_URL]: "alpha-secret",
    }, true, (win) => {
        win.localStorage.setItem(NSFW_CONSENT_STORAGE_KEY, JSON.stringify(true));
    });
};

const getHarborLanternCard = () => cy.get(".CartPage .ant-list-item", { timeout: 20000 }).first();

const getHarborLanternControl = () => getHarborLanternCard().find(".AddToCartButton__quantity");

describe("cart control", () => {
    it("persists arrow changes across a remount", () => {
        mountCartControl();

        getHarborLanternControl().find("input").should("have.value", "1");
        getHarborLanternControl().find(".ant-input-number-handler-up").click({ force: true });
        getHarborLanternControl().find("input").should("have.value", "2");

        mountCartControl();
        getHarborLanternControl().find("input").should("have.value", "2");
    });

    it("removes the item when the quantity reaches zero", () => {
        mountCartControl();

        getHarborLanternControl().find("input").should("have.value", "1");
        getHarborLanternControl().find(".ant-input-number-handler-down").click({ force: true });
        cy.contains(".CartPage .ant-list-item", "Harbor Lantern", { timeout: 20000 }).should("not.exist");

        mountCartControl();
        cy.contains(".CartPage .ant-list-item", "Harbor Lantern", { timeout: 20000 }).should("not.exist");
    });

    it("does not keep negative values in the quantity field", () => {
        mountCartControl();

        getHarborLanternControl().find("input").type("-", { force: true }).blur();
        getHarborLanternControl().find("input").should("have.value", "1");
    });

    it("waits until blur before persisting typed quantities", () => {
        mountCartControl();

        getHarborLanternControl().find("input").should("have.value", "1");
        getHarborLanternControl().find("input").type("5");
        getHarborLanternControl().find("input").should("have.value", "15");
        getHarborLanternControl().find("input").blur();

        mountCartControl();
        getHarborLanternControl().find("input").should("have.value", "15");
    });
});
