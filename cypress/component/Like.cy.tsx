import { mount } from "cypress/react";
import { User, UserManager } from "oidc-client-ts";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { AuthContextProvider } from "../../src/components/AuthContext";
import { EndpointContextProvider } from "../../src/components/EndpointContext";
import { PublishContent } from "../../src/components/publish/PublishContent";
import { Like } from "../../src/components/shared/Like/Like";

type LikeMutationCall = {
    id: string;
    liked: boolean;
    url?: string | null;
};

type DislikeMutationCall = {
    id: string;
    url?: string | null;
};

const buildAuthStorageKey = (serverURL: string) =>
    `oidc.user:${serverURL}/api/auth:${process.env.REACT_APP_OIDC_CLIENT_ID || ""}`;

const seedAuthenticatedUser = (serverURL: string, emailVerified = true) => {
    cy.window().then((win) => {
        const now = Math.floor(Date.now() / 1000);
        const user = new User({
            access_token: "mock-like-access-token",
            token_type: "Bearer",
            scope: "openid profile email",
            expires_at: now + 3600,
            profile: {
                iss: `${serverURL}/api/auth`,
                aud: "frontend-app",
                exp: now + 3600,
                iat: now,
                sub: "user-like-test",
                email: "like@example.test",
                email_verified: emailVerified,
                name: "Like Tester",
            },
        });

        win.localStorage.setItem(buildAuthStorageKey(serverURL), user.toStorageString());
    });
};

const seedEndpointUrls = (serverURL: string) => {
    cy.window().then((win) => {
        win.localStorage.setItem(
            "endpoints.urls",
            JSON.stringify([
                {
                    enabled: true,
                    value: serverURL,
                    name: "Main",
                },
            ]),
        );
    });
};

const mountLike = (liked: boolean | null | undefined, authenticated: boolean, emailVerified = true) => {
    const likeMutation = cy.stub();
    const dislikeMutation = cy.stub();
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnMount: false,
                refetchOnReconnect: false,
                refetchOnWindowFocus: false,
            },
        },
    });

    seedEndpointUrls(MAIN_SERVER_URL);

    if (authenticated) {
        seedAuthenticatedUser(MAIN_SERVER_URL, emailVerified);
    }

    mount(
        <QueryClientProvider client={queryClient}>
            <MemoryRouter initialEntries={["/"]}>
                <EndpointContextProvider>
                    <AuthContextProvider>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <Like
                                        id="post-harbor-lantern"
                                        liked={liked}
                                        likeCount={42}
                                        serverURL={MAIN_SERVER_URL}
                                        likeMutation={{ mutate: likeMutation }}
                                        dislikeMutation={{ mutate: dislikeMutation }}
                                    />
                                }
                            />
                            <Route path="/publish" element={<PublishContent url={MAIN_SERVER_URL} />} />
                        </Routes>
                    </AuthContextProvider>
                </EndpointContextProvider>
            </MemoryRouter>
        </QueryClientProvider>,
    );

    return { likeMutation, dislikeMutation };
};

describe("like", () => {
    const outlinedCases: Array<{ liked: boolean | null | undefined; label: string }> = [
        { liked: false, label: "false" },
        { liked: null, label: "null" },
        { liked: undefined, label: "undefined" },
    ];

    outlinedCases.forEach((testCase) => {
        it(`renders the outlined heart for ${testCase.label} liked state and uses the like mutation`, () => {
            const stubs = mountLike(testCase.liked, true);
            const expectedLikeCall: LikeMutationCall = {
                id: "post-harbor-lantern",
                liked: true,
                url: MAIN_SERVER_URL,
            };

            cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--unliked");
            cy.get(".LikeButton").should("have.css", "border-radius", "999px");
            cy.get(".LikeButton").should("have.css", "transition-property").and("contain", "transform");
            cy.get(".LikeButton").should("have.css", "background-image", "none");
            cy.get(".LikeButton").should("have.css", "background-color", "rgba(0, 0, 0, 0)");
            cy.get(".LikeButton").should("have.css", "box-shadow", "none");
            cy.get(".LikeButton").should("have.css", "text-shadow").and("not.equal", "none");
            cy.get(".LikeButton__heart--outlined").should("be.visible");
            cy.get(".LikeButton__count").should("have.text", "42");

            cy.get(".LikeButton").click();

            cy.get(".LikeButton").should("not.have.class", "LikeButton--loading");
            cy.get(".LikeButton .ant-btn-loading-icon").should("not.exist");
            cy.get(".LikeButton__count").should("have.text", "43");
            cy.get(".LikeButton").should("have.attr", "aria-pressed", "true");
            cy.wrap(stubs.likeMutation).should("have.been.calledWith", expectedLikeCall);
            cy.wrap(stubs.dislikeMutation).should("not.have.been.called");
        });
    });

    it("renders the filled heart for liked state and uses the dislike mutation", () => {
        const stubs = mountLike(true, true);
        const expectedDislikeCall: DislikeMutationCall = {
            id: "post-harbor-lantern",
            url: MAIN_SERVER_URL,
        };

        cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--liked");
        cy.get(".LikeButton__heart--filled").should("be.visible");
        cy.get(".LikeButton").should("have.css", "color").and("not.equal", "rgb(0, 0, 0)");
        cy.get(".LikeButton").click();

        cy.get(".LikeButton").should("not.have.class", "LikeButton--loading");
        cy.get(".LikeButton .ant-btn-loading-icon").should("not.exist");
        cy.get(".LikeButton__count").should("have.text", "41");
        cy.get(".LikeButton").should("have.attr", "aria-pressed", "false");
        cy.wrap(stubs.dislikeMutation).should("have.been.calledWith", expectedDislikeCall);
        cy.wrap(stubs.likeMutation).should("not.have.been.called");
    });

    it("redirects anonymous users to login on the correct server before liking", () => {
        const signinRedirect = cy.stub(UserManager.prototype, "signinRedirect").resolves();

        const stubs = mountLike(false, false);

        cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--unliked");
        cy.get(".LikeButton").click();

        cy.wrap(signinRedirect).should("have.been.calledOnce");
        cy.get(".ant-dropdown").should("not.exist");
        cy.wrap(stubs.likeMutation).should("not.have.been.called");
        cy.wrap(stubs.dislikeMutation).should("not.have.been.called");
    });

    it("does not open an endpoint dropdown when liking known-server content", () => {
        mountLike(false, true);

        cy.get(".LikeButton").should("be.visible").click();
        cy.get(".ant-dropdown").should("not.exist");
    });

    it("routes unverified users to the email verification warning before liking", () => {
        const stubs = mountLike(false, true, false);

        cy.get(".LikeButton").should("be.visible").and("have.class", "LikeButton--unliked");
        cy.get(".LikeButton").click();

        cy.contains("Please verify your email first", { timeout: 20000 }).should("be.visible");
        cy.contains("Your email address still needs to be verified on Main before you can continue.").should(
            "be.visible",
        );
        cy.wrap(stubs.likeMutation).should("not.have.been.called");
        cy.wrap(stubs.dislikeMutation).should("not.have.been.called");
    });

    it("keeps the heart icon and count centered on the same horizontal line", () => {
        mountLike(false, true);

        cy.get(".LikeButton__heart").then(($heart) => {
            const heartRect = $heart[0].getBoundingClientRect();

            cy.get(".LikeButton__count").then(($count) => {
                const countRect = $count[0].getBoundingClientRect();
                const heartCenterY = heartRect.top + heartRect.height / 2;
                const countCenterY = countRect.top + countRect.height / 2;

                expect(Math.abs(heartCenterY - countCenterY)).to.be.lessThan(2);
            });
        });
    });
});
