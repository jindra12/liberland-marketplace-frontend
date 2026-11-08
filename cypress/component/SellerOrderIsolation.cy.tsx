import React from "react";
import OrderList from "../../src/components/OrderList";
import type { SellerOrderProduct } from "../../src/components/orderList/types";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";

const order: SellerOrderProduct = {
    id: "shared-proof",
    orderId: "shared-order",
    paymentProofId: "shared-proof",
    productId: "product",
    chain: "ethereum",
    fulfilled: false,
    rejected: false,
    quantity: 1,
    orderStatus: "completed",
    orderCreatedAt: "2026-11-01T12:00:00Z",
    transactionHash: "0x123",
    paymentProof: {
        id: "shared-proof",
        chain: "ethereum",
        transactionHash: "0x123",
        fulfilled: false,
        rejected: false,
    },
    product: { id: "product", name: "Remote seller product" },
};

describe("Seller order authority and settlement boundaries", { retries: 0 }, () => {
    it("reads and fulfills an order only on the selected backend, even when another backend reuses its ID", () => {
        const mainRequests = cy.stub().as("mainSellerRequests");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            mainRequests();
            request.reply({ data: { sellerOrderProducts: { docs: [], totalDocs: 0 } } });
        });
        cy.intercept<{ query: string }>("POST", `${COOP_SERVER_URL}/api/graphql`, (request) => {
            if (request.body.query.includes("mutation UpdateSellerOrderProductFulfilled")) {
                request.alias = "remoteFulfill";
                request.reply({ data: { updateSellerOrderProductFulfilled: { ...order, fulfilled: true } } });
                return;
            }
            request.alias = "remoteSellerList";
            request.reply({
                data: {
                    sellerOrderProducts: {
                        docs: [order],
                        totalDocs: 1,
                        page: 1,
                        limit: 20,
                        totalPages: 1,
                        hasNextPage: false,
                        hasPrevPage: false,
                    },
                },
            });
        });
        mountPublicFederatedList(<OrderList />, undefined, { authUrl: COOP_SERVER_URL, authenticated: true });
        cy.wait("@remoteSellerList");
        cy.contains("Remote seller product").should("be.visible");
        cy.contains("button", "Mark fulfilled").click();
        cy.wait("@remoteFulfill").its("request.body.variables.orderId").should("equal", "shared-order");
        cy.get("@mainSellerRequests").should("not.have.been.called");
    });
});
