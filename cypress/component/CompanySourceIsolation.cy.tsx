import React from "react";
import { AuthContext } from "react-oidc-context";
import { User } from "oidc-client-ts";
import { CompanyField } from "../../src/components/CompanyField";
import { buildTestAuthContext } from "../support/component-tests/mountBasic";
import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";

describe("Company selection uses its backend account", { retries: 0 }, () => {
    it("loads the selected backend's own companies instead of the active authority's companies", () => {
        const mainRequests = cy.stub().as("mainRequests");
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            mainRequests();
            request.reply({ data: {} });
        });
        cy.intercept<{ query: string; variables?: { userId?: string } }>(
            "POST",
            `${COOP_SERVER_URL}/api/graphql`,
            (request) => {
                if (request.body.query.includes("query MeUser")) {
                    request.reply({ data: { meUser: { user: { id: "coop-user" } } } });
                    return;
                }
                request.alias = "coopCompanies";
                request.reply({
                    data: { Companies: { docs: [{ id: "coop-company", name: "Co-op Workshop", isPrivate: false }] } },
                });
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
                <CompanyField serverURL={COOP_SERVER_URL} />
            </AuthContext.Provider>,
        );
        cy.wait("@coopCompanies").its("request.body.variables.userId").should("equal", "coop-user");
        cy.get(".ant-select").click();
        cy.contains(".ant-select-item-option", "Co-op Workshop").click();
        cy.get(".ant-select").should("contain.text", "Co-op Workshop");
        cy.get("@mainRequests").should("not.have.been.called");
    });

    it("never loads an unscoped company list when the selected backend has no signed-in user", () => {
        const companyRequests = cy.stub().as("companyRequests");
        cy.intercept<{ query: string }>("POST", `${COOP_SERVER_URL}/api/graphql`, (request) => {
            if (request.body.query.includes("query MeUser")) {
                request.alias = "anonymousBackend";
                request.reply({ data: { meUser: { user: null } } });
                return;
            }
            companyRequests();
            request.reply({ data: { Companies: { docs: [] } } });
        });
        mountPublicFederatedList(<CompanyField serverURL={COOP_SERVER_URL} />);
        cy.wait("@anonymousBackend");
        cy.get(".ant-select").should("have.class", "ant-select-disabled");
        cy.get("@companyRequests").should("not.have.been.called");
    });
});
