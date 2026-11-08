import React from "react";
import { mount } from "cypress/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "react-oidc-context";
import { EndpointContext } from "../../src/components/EndpointContext";
import { createLikeSecurityFixture, renderLikeSecurity } from "../support/security-regressions/like/utils";
import type { LikeProps } from "../../src/components/shared/Like/Like";
import { LikeMutationFailureProbe } from "../support/security-regressions/LikeMutationFailureProbe";

describe("Source-bound like state", { retries: 0 }, () => {
    [false, true].forEach((liked) => {
        it(`restores the previous state when a backend rejects ${liked ? "unliking" : "liking"} a post`, () => {
            const fixture = createLikeSecurityFixture();
            const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
            cy.intercept("POST", `${fixture.endpoint.authUrl}/api/graphql`, {
                statusCode: 403,
                body: { errors: [{ message: "This account cannot change likes on this post." }] },
            }).as("rejectedLike");
            mount(
                <QueryClientProvider client={client}>
                    <AuthProvider userManager={fixture.manager} skipSigninCallback>
                        <EndpointContext.Provider value={fixture.endpoint}>
                            <LikeMutationFailureProbe serverUrl={fixture.endpoint.authUrl} liked={liked} />
                        </EndpointContext.Provider>
                    </AuthProvider>
                </QueryClientProvider>,
            );
            cy.get(".LikeButton").should("have.attr", "aria-pressed", String(liked)).click();
            cy.wait("@rejectedLike");
            cy.get('[data-cy="like-request-state"]').should("have.text", "rejected");
            cy.get(".LikeButton").should("not.be.disabled");
            cy.get(".LikeButton").should("have.attr", "aria-pressed", String(liked));
            cy.get(".LikeButton__count").should("have.text", "4");
        });
    });

    it("updates a refreshed like count instead of retaining the initial count", () => {
        const fixture = createLikeSecurityFixture();
        const props: LikeProps = {
            id: "post",
            liked: false,
            likeCount: 4,
            serverURL: fixture.endpoint.authUrl,
            likeMutation: { mutate: cy.stub() },
            dislikeMutation: { mutate: cy.stub() },
        };
        mount(renderLikeSecurity(props, fixture)).then((component) => {
            cy.get(".LikeButton__count").should("have.text", "4");
            cy.then(() => component.rerender(renderLikeSecurity({ ...props, likeCount: 7 }, fixture)));
            cy.get(".LikeButton__count").should("have.text", "7");
        });
    });

    it("does not carry one post's liked state into another post reusing the list row", () => {
        const fixture = createLikeSecurityFixture();
        const props: LikeProps = {
            id: "first-post",
            liked: true,
            likeCount: 4,
            serverURL: fixture.endpoint.authUrl,
            likeMutation: { mutate: cy.stub() },
            dislikeMutation: { mutate: cy.stub() },
        };
        mount(renderLikeSecurity(props, fixture)).then((component) => {
            cy.get(".LikeButton").should("have.attr", "aria-pressed", "true");
            cy.then(() =>
                component.rerender(renderLikeSecurity({ ...props, id: "second-post", liked: false }, fixture)),
            );
            cy.get(".LikeButton").should("have.attr", "aria-pressed", "false");
        });
    });

    it("does not use the active backend account to authorize a like on another backend", () => {
        const fixture = createLikeSecurityFixture();
        fixture.endpoint.urls.push({ value: "https://other-market.example", name: "Other", enabled: true });
        const mutate = cy.stub().as("submitLike");
        mount(
            renderLikeSecurity(
                {
                    id: "post",
                    liked: false,
                    likeCount: 4,
                    serverURL: "https://other-market.example",
                    likeMutation: { mutate },
                    dislikeMutation: { mutate: cy.stub() },
                },
                fixture,
            ),
        );
        cy.get(".LikeButton").click();
        cy.get("@submitLike").should("not.have.been.called");
        cy.get("@switchAuthServer").should("have.been.calledWith", "https://other-market.example");
    });
});
