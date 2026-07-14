import { detailRoute, DETAIL_HOME_GOALS, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { goToDetailFromHome, mountMainRoute, screenshotStep } from "../support/component-tests/utils";

type GraphQLRequestBody = {
    operationName?: string;
    query?: string;
};

describe("details", () => {
    beforeEach(() => {
        cy.viewport(1200, 1200);
        cy.on("uncaught:exception", (error) => {
            if (error.message.includes("ResizeObserver loop completed with undelivered notifications")) {
                return false;
            }

            return undefined;
        });
    });

    DETAIL_HOME_GOALS.forEach((goal) => {
        it(`opens the ${goal.title} detail from home`, () => {
            goToDetailFromHome(goal);
        });
    });

    it("opens the Dockmaster detail from home on mobile", () => {
        cy.viewport(390, 844);
        const detailGoal = DETAIL_HOME_GOALS.find((goal) => goal.title === "Dockmaster");
        if (detailGoal === undefined) {
            throw new Error("Missing Dockmaster detail goal");
        }

        mountMainRoute(detailGoal.route);
        cy.location("pathname").should("eq", detailGoal.route);
        cy.contains(detailGoal.detailTitleSelector, detailGoal.title).should("be.visible");
        screenshotStep(`detail-mobile-${detailGoal.title}`);
    });

    it("shows the original post link in the post detail header", () => {
        cy.intercept("POST", `${MAIN_SERVER_URL}/api/graphql`, (req) => {
            const body = req.body as GraphQLRequestBody;
            if (body.operationName === "PostById" || body.query?.includes("PostById")) {
                req.reply({
                    data: {
                        Post: {
                            id: "post-1",
                            title: "Harbor Launch Notes",
                            slug: "harbor-launch-notes",
                            repost: "https://example.test/original/harbor-launch-notes",
                            heroImage: {
                                id: "post-harbor-launch-notes",
                                url: "/images/post-harbor-launch-notes.png",
                                alt: "Harbor Launch Notes",
                                filename: "post-harbor-launch-notes.png",
                                width: 1600,
                                height: 900,
                                mimeType: "image/png",
                            },
                            content: "Harbor launch notes with **markdown** and a [link](https://harbor.example).",
                            meta: {
                                title: "Harbor Launch Notes",
                                description: "Harbor launch notes with markdown and a link",
                                image: {
                                    id: "post-harbor-launch-notes-meta",
                                    url: "/images/post-harbor-launch-notes-meta.png",
                                    alt: "Harbor Launch Notes meta",
                                    filename: "post-harbor-launch-notes-meta.png",
                                    width: 1600,
                                    height: 900,
                                    mimeType: "image/png",
                                },
                            },
                            company: {
                                id: "company-harbor-labs",
                                serverURL: MAIN_SERVER_URL,
                                name: "Harbor Labs",
                                description: "Distributed shipping and tooling",
                                cryptoAddresses: [],
                                identity: {
                                    id: "identity-harbor",
                                    serverURL: MAIN_SERVER_URL,
                                    name: "Harbor Identity",
                                    description: "Harbor identity",
                                },
                                image: {
                                    id: "company-harbor-labs",
                                    url: "/images/company-harbor-labs.png",
                                    alt: "Harbor Labs",
                                    filename: "company-harbor-labs.png",
                                    width: 512,
                                    height: 512,
                                    mimeType: "image/png",
                                },
                            },
                            createdBy: {
                                id: "user-nova",
                                name: "Nova Rivers",
                            },
                            relatedPosts: [],
                            hasLiked: false,
                            likeCount: 0,
                            publishedAt: "2025-02-14T09:00:00.000Z",
                            updatedAt: "2025-02-14T09:05:00.000Z",
                            createdAt: "2025-02-13T09:00:00.000Z",
                            _status: "published",
                        },
                    },
                });
            }

            if (body.operationName === "ListCommentsByTarget" || body.query?.includes("ListCommentsByTarget")) {
                req.reply({
                    data: {
                        Comments: {
                            docs: [],
                            totalDocs: 0,
                            limit: 20,
                            totalPages: 1,
                            page: 1,
                            hasPrevPage: false,
                            hasNextPage: false,
                            prevPage: null,
                            nextPage: null,
                        },
                    },
                });
            }
        });
        mountMainRoute(detailRoute("/posts", "post-1"));
        cy.contains("h1", "Harbor Launch Notes").should("be.visible");
        cy.get(".PostDetail__metaStack")
            .should("be.visible")
            .children()
            .should("have.length", 2)
            .then(($children) => {
                expect($children.eq(0)).to.have.class("PostDetail__companyLink");
                expect($children.eq(1)).to.have.class("PostDetail__repostLink");
            });
        cy.get(".PostDetail__companyLink").contains("Harbor Labs").should("be.visible");
        cy.get(".PostDetail__repostLink").should("be.visible");
        cy.get(".PostDetail__repostLink .PostRepostLink__icon").should("be.visible");
        cy.get(".PostDetail__repostLink")
            .should("have.attr", "href", "https://example.test/original/harbor-launch-notes");
        cy.get(".PostDetail__repostLink").contains("Original post").should("be.visible");
        cy.get(".PostDetail__repostLink").should("have.css", "font-size", "15px");
        screenshotStep("detail-post-repost-link");
    });

});
