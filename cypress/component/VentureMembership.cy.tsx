import React from "react";
import { AuthContext } from "react-oidc-context";
import { User } from "oidc-client-ts";
import { getOperationAST, parse } from "graphql";
import { StartupMembershipProbe } from "../support/security-regressions/StartupMembershipProbe";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";
import { buildTestAuthContext } from "../support/component-tests/mountBasic";
import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";

describe("Backend-specific Venture membership", { retries: 0 }, () => {
    it("leaves and rejoins using the Venture backend's account while another authority is active", () => {
        const state = { joined: true };
        const mainRequests = cy.stub().as("mainRequests");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            mainRequests();
            request.reply({ data: {} });
        });
        cy.intercept<{ query: string; variables: { id: string } }>(
            "POST",
            `${COOP_SERVER_URL}/api/graphql`,
            (request) => {
                const operation = getOperationAST(parse(request.body.query))?.name?.value;
                if (operation === "MeUser") {
                    request.reply({ data: { meUser: { user: { id: "coop-user" } } } });
                    return;
                }
                const startup = {
                    id: "membership-venture",
                    title: "Co-op Venture",
                    serverURL: COOP_SERVER_URL,
                    createdBy: { id: "founder" },
                    involvedUsers: state.joined
                        ? [{ id: "coop-user", name: "Co-op member", email: "member@example.test" }]
                        : [],
                };
                switch (operation) {
                    case "LeaveStartup":
                        state.joined = false;
                        request.alias = "leaveVenture";
                        request.reply({ data: { leaveStartup: { ...startup, involvedUsers: [] } } });
                        return;
                    case "JoinStartup":
                        state.joined = true;
                        request.alias = "joinVenture";
                        request.reply({
                            data: {
                                joinStartup: {
                                    ...startup,
                                    involvedUsers: [
                                        { id: "coop-user", name: "Co-op member", email: "member@example.test" },
                                    ],
                                },
                            },
                        });
                        return;
                    default:
                        request.reply({ data: { Startup: startup } });
                }
            },
        );
        mountPublicFederatedList(
            <AuthContext.Provider
                value={buildTestAuthContext({
                    isAuthenticated: true,
                    user: new User({
                        access_token: "main-token",
                        token_type: "Bearer",
                        profile: {
                            sub: "main-user",
                            iss: `${MAIN_SERVER_URL}/api/auth`,
                            aud: "frontend-app",
                            exp: 2000000000,
                            iat: 1900000000,
                        },
                    }),
                })}
            >
                <StartupMembershipProbe id="membership-venture" serverURL={COOP_SERVER_URL} />
            </AuthContext.Provider>,
        );
        cy.get('[data-cy="detail-membership"]').contains("button", "Remove Involvement").click();
        cy.wait("@leaveVenture").its("request.body.variables.id").should("equal", "membership-venture");
        cy.get('[data-cy="list-membership"]').contains("button", "Get Involved").click();
        cy.wait("@joinVenture").its("request.body.variables.id").should("equal", "membership-venture");
        cy.get('[data-cy="detail-membership"]').contains("button", "Remove Involvement").should("be.visible");
        cy.get('[data-cy="list-membership"]').contains("button", "Remove Involvement").should("be.visible");
        cy.get("@mainRequests").should("not.have.been.called");
    });
});
