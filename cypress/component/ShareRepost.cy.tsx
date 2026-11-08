import React from "react";
import { AuthContext } from "react-oidc-context";
import { User } from "oidc-client-ts";
import { getOperationAST, parse } from "graphql";
import { ShareRepostAction } from "../../src/components/share/ShareRepostAction";
import { buildTestAuthContext } from "../support/component-tests/mountBasic";
import { MAIN_SERVER_URL, COOP_SERVER_URL, detailRoute } from "../support/component-tests/constants";
import { mountPublicFederatedList } from "../support/security-regressions/lists/utils";

const mountRepost = (serverUrl: string) => {
    const auth = buildTestAuthContext();
    return mountPublicFederatedList(
        <AuthContext.Provider
            value={{
                ...auth,
                isAuthenticated: true,
                settings: { ...auth.settings, authority: `${MAIN_SERVER_URL}/api/auth` },
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
            }}
        >
            <ShareRepostAction contentLink={detailRoute("/jobs", "reposted-job", serverUrl)} />
        </AuthContext.Provider>,
    );
};

describe("Source-authorized reposting", { retries: 0 }, () => {
    it("selects an owned company and publishes to the backend encoded in the content link", () => {
        cy.intercept<{ query: string }>("POST", `${MAIN_SERVER_URL}/api/graphql`, (request) => {
            switch (getOperationAST(parse(request.body.query))?.name?.value) {
                case "MeUser":
                    request.reply({ data: { meUser: { user: { id: "main-user" } } } });
                    return;
                case "ListCompaniesByCreator":
                    request.reply({
                        data: {
                            Companies: { docs: [{ id: "author-company", name: "Author Company", isPrivate: false }] },
                        },
                    });
                    return;
                case "ShareRepost":
                    request.alias = "publishRepost";
                    request.reply({ data: { shareRepost: { id: "new-repost" } } });
            }
        });
        mountRepost(MAIN_SERVER_URL);
        cy.get('button[aria-label="Repost content"]').click();
        cy.contains(".ant-modal", "Add your take").should("be.visible");
        cy.get(".ant-modal .ant-select").should("not.have.class", "ant-select-disabled").click();
        cy.contains(".ant-select-item-option", "Author Company").click();
        cy.get(".ant-modal textarea").type("A useful repost.");
        cy.contains(".ant-modal button", "Repost").click();
        cy.wait("@publishRepost")
            .its("request.body.variables.input")
            .should("deep.equal", {
                companyId: "author-company",
                description: "A useful repost.",
                link: detailRoute("/jobs", "reposted-job", MAIN_SERVER_URL),
            });
        cy.get(".ant-modal").should("not.exist");
    });

    it("does not use an active main-server account to bypass the target backend's authentication", () => {
        const targetRequests = cy.stub().as("targetRequests");
        cy.intercept("POST", `${COOP_SERVER_URL}/api/graphql`, (request) => {
            targetRequests();
            request.reply({ data: {} });
        });
        mountRepost(COOP_SERVER_URL);
        cy.get('button[aria-label="Repost content"]').click();
        cy.get("@selectAuthServer").should("have.been.calledOnceWith", COOP_SERVER_URL);
        cy.get("@queueAuthAction").should("have.been.calledOnce");
        cy.get(".ant-modal").should("not.exist");
        cy.get("@targetRequests").should("not.have.been.called");
    });
});
