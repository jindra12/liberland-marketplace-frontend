import * as React from "react";

import OrderList from "../../src/components/OrderList";
import { buildTestAuthContext, mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";

const mountOrderList = (route: string = "/orders") => {
    mountWithProviders(<OrderList />, {
        route,
        auth: buildTestAuthContext({
            isAuthenticated: true,
        }),
    });
};

describe("orders", () => {
    it("renders seller orders and lets the user switch their status on desktop", () => {
        cy.viewport(1440, 900);
        mountOrderList();

        cy.contains("h2", "Orders").should("be.visible");
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .as("solarOrder");

        cy.get("@solarOrder").contains(".OrderList__statusTag", "Pending").should("be.visible");
        cy.get("@solarOrder")
            .contains(".OrderList__wallet", "SoOrderAlpha1515")
            .should("be.visible");
        cy.get("@solarOrder")
            .contains(".OrderList__shippingAddressLine", "1 Harbor Way · Suite 42 · Port Sol, Coast, 11000 · Liberland")
            .should("be.visible");
        cy.get("@solarOrder")
            .contains(".OrderList__shippingContactLine", "nova@example.test · +1 555 0101")
            .should("be.visible");
        cy.get("@solarOrder").find(".OrderList__divider").should("be.visible");
        cy.get("@solarOrder")
            .contains(".OrderList__transactionLink", "View transaction on Solscan")
            .should("have.attr", "href", "https://solscan.io/tx/solana-tx-alpha-1");

        screenshotStep("orders-list-pending");

        cy.get("@solarOrder").contains("button", "Mark fulfilled").click();
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .contains(".OrderList__statusTag", "Fulfilled")
            .should("be.visible");
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .contains("button", "Mark fulfilled")
            .should("be.disabled");

        screenshotStep("orders-list-fulfilled");

        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .contains("button", "Mark rejected")
            .click();
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .contains(".OrderList__statusTag", "Rejected")
            .should("be.visible");
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .contains("button", "Mark rejected")
            .should("be.disabled");

        screenshotStep("orders-list-rejected");
    });

    it("renders seller orders on mobile with the compact shipping details layout", () => {
        cy.viewport(390, 844);
        mountOrderList();

        cy.contains("h2", "Orders").should("be.visible");
        cy.contains(".OrderList__productName", "Solar Widget")
            .closest(".ant-list-item")
            .as("solarOrderMobile");

        cy.get("@solarOrderMobile")
            .contains(".OrderList__shippingAddressLine", "1 Harbor Way · Suite 42 · Port Sol, Coast, 11000 · Liberland")
            .should("be.visible");
        cy.get("@solarOrderMobile")
            .contains(".OrderList__shippingContactLine", "nova@example.test · +1 555 0101")
            .should("be.visible");
        cy.get("@solarOrderMobile").find(".OrderList__divider").should("be.visible");

        screenshotStep("orders-list-mobile");
    });
});
