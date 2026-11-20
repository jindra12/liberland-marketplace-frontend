import React from "react";
import { encodeServerUrlSegment } from "../../src/routes";
import Unsubscribe from "../../src/components/Unsubscribe/Unsubscribe";
import { buildNotificationSubscriptionID } from "../../src/components/share/SubscribeButton/utils";

import { mountWithProviders } from "../support/component-tests/utils";
import { seedAuthorizedProfile } from "../support/component-tests/auth";

const MAIN_SERVER_URL = "http://127.0.0.1:3010";

describe("unsubscribe", () => {
    it("shows the invalid-link page when required query params are missing", () => {
        mountWithProviders(<Unsubscribe />, { route: "/unsubscribe" });

        cy.contains("Invalid link").should("be.visible");
        cy.contains("This unsubscribe link is missing required details.").should("be.visible");
        cy.get(".UnsubscribePage__card").scrollIntoView().should("be.visible").screenshot("unsubscribe-invalid-link-missing-query-params");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
    });

    it("shows the invalid-link page when the notification type is unsupported", () => {
        mountWithProviders(<Unsubscribe />, {
            route: `/unsubscribe?type=widgets&id=widget-1&serverUrl=${encodeServerUrlSegment(MAIN_SERVER_URL)}`,
        });

        cy.contains("Invalid link").should("be.visible");
        cy.contains("This unsubscribe link does not target a supported notification type.").should("be.visible");
        cy.get(".UnsubscribePage__card").scrollIntoView().should("be.visible").screenshot("unsubscribe-invalid-link-unsupported-type");
        cy.contains("Back to homepage").click();
        cy.location("pathname").should("eq", "/");
    });

    ["", "&email=somebody-else@example.test"].forEach((extraQuery) => {
        it(`unsubscribes the signed-in account ${extraQuery ? "despite a forged URL mailbox" : "without putting its mailbox in the link"}`, () => {
            const subscriptionID = buildNotificationSubscriptionID({
                email: "nova@example.test", targetCollection: "companies", targetID: "company-privacy",
            });
            cy.intercept("POST", "**/api/graphql", (req) => {
                const body = req.body as {
                    operationName?: string; query?: string; variables: { subscriptionID?: string };
                };
                if (body.operationName === "CompanyById" || body.query?.includes("query CompanyById")) {
                    req.alias = "unsubscribeCompany";
                    req.reply({ data: { Company: {
                        id: "company-privacy", name: "Privacy Company", description: "Marketplace company",
                        serverURL: MAIN_SERVER_URL, image: null,
                    } } });
                }
                if (body.operationName === "UnsubscribeFromCompanyUpdates" || body.query?.includes("mutation UnsubscribeFromCompanyUpdates")) {
                    req.alias = "removeOwnSubscription";
                    expect(body.variables.subscriptionID).to.equal(subscriptionID);
                    req.reply({ data: { deleteNotificationSubscription: { id: subscriptionID } } });
                }
            });
            mountWithProviders(<Unsubscribe />, {
                route: `/unsubscribe?type=Companies&id=company-privacy&serverUrl=${encodeServerUrlSegment(MAIN_SERVER_URL)}${extraQuery}`,
                setup: (win) => seedAuthorizedProfile(win, MAIN_SERVER_URL),
            });
            cy.wait("@unsubscribeCompany");
            cy.contains("Unsubscribe from Privacy Company?").should("be.visible");
            cy.contains("Your signed-in account").should("be.visible");
            cy.contains("somebody-else@example.test").should("not.exist");
            cy.get(".UnsubscribePage__card").scrollIntoView().should("be.visible").screenshot(`unsubscribe-private-account${extraQuery ? "-forged-mailbox" : ""}`);
            cy.contains("button", "Yes, unsubscribe me").click();
            cy.wait("@removeOwnSubscription");
            cy.contains("You're all set").should("be.visible");
        });
    });
});
