import AppLayout from "../../src/components/AppLayout";
import Splash from "../../src/components/Splash";
import { SORT_CONTENT_BY_STORAGE_KEY } from "../../src/components/SortContentBySelect/constants";
import { MAIN_SERVER_URL, COOP_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/direct";
import { posts } from "../support/graphqlMock/fixtures/posts";
import { collection } from "../support/graphqlMock/fixtures/shared";
import { interceptGraphQLOperation } from "../support/graphqlMock/intercept";

describe("interleaved popular homepage feed", () => {
    [390, 1280].forEach((width) => {
        it(`alternates marketplace sections with unique, ranked posts at ${width}px`, () => {
            cy.viewport(width, 1100);
            interceptGraphQLOperation<{ page: number; limit: number; sort: string }>("ListPosts", (request) => {
                expect(request.body.variables.sort).to.equal("-likeCount");
                const docs = request.url.startsWith(MAIN_SERVER_URL) ? posts : [];
                request.reply({ data: { Posts: collection([...docs].reverse()) } });
            }).as("popularPosts");
            mountWithProviders(
                <AppLayout>
                    <Splash />
                </AppLayout>,
                {
                    route: "/",
                    setup: (win) => win.localStorage.setItem(SORT_CONTENT_BY_STORAGE_KEY, JSON.stringify("-createdAt")),
                },
            );
            cy.wait("@popularPosts");
            cy.get('[data-section="posts-top"] .ant-list-item').should("have.length", 3);
            cy.get('[data-section="posts-firstMiddle"] .ant-list-item').should("have.length", 3);
            cy.get('[data-section="posts-secondMiddle"] .ant-list-item').should("have.length", 2);
            cy.get('[data-section="posts-thirdMiddle"] .ant-list-item').should("have.length", 4);
            cy.get('[data-section="posts-top"] .ant-list-item-meta-title a')
                .first()
                .should("have.text", "Harbor Operations Digest");
            cy.get('[data-section^="posts-"] .ant-list-item-meta-title a').should(($links) => {
                const urls = $links.toArray().map((link) => link.getAttribute("href"));
                expect(new Set(urls).size).to.equal(urls.length);
                expect(urls).to.have.length(posts.length);
            });
            cy.get("[data-section]").should(($sections) => {
                expect(
                    $sections
                        .toArray()
                        .slice(0, 9)
                        .map((section) => section.getAttribute("data-section")),
                ).to.deep.equal([
                    "products",
                    "posts-top",
                    "companies",
                    "posts-firstMiddle",
                    "jobs",
                    "posts-secondMiddle",
                    "ventures",
                    "posts-thirdMiddle",
                    "tribes",
                ]);
            });
            cy.request("/logo.svg").its("body").should("contain", 'stop-color="#78B4A2"');
            screenshotStep(`mint-homepage-${width}`, "viewport");
            cy.get('[data-section="companies"]').then(($section) => {
                cy.get(".AppHeader").then(($header) => {
                    cy.scrollTo(0, $section.offset()!.top - $header.outerHeight()! - 80);
                });
            });
            screenshotStep(`posts-to-companies-${width}`, "viewport");
        });
    });

    it("ranks syndicated posts together and appends pagination without repeating featured posts", () => {
        const mainPosts = Array.from({ length: 24 }, (_, index) => ({
            ...posts[0],
            id: `main-post-${index}`,
            slug: `main-post-${index}`,
            title: `Main post ${index}`,
            likeCount: 100 - index,
            heroImage: null,
            content: "Marketplace update",
            meta: null,
        }));
        const coopPosts = [
            {
                ...mainPosts[0],
                id: "coop-leading-post",
                slug: "coop-leading-post",
                title: "Coop leading post",
                likeCount: 200,
            },
        ];
        interceptGraphQLOperation<{ page: number; limit: number; sort: string }>("ListPosts", (request) => {
            const { page, limit, sort } = request.body.variables;
            expect(sort).to.equal("-likeCount");
            const docs = request.url.startsWith(MAIN_SERVER_URL)
                ? mainPosts
                : request.url.startsWith(COOP_SERVER_URL)
                  ? coopPosts
                  : [];
            request.alias = `postPage${page}`;
            request.reply({
                data: {
                    Posts: {
                        ...collection(docs.slice((page - 1) * limit, page * limit)),
                        totalDocs: docs.length,
                        hasNextPage: page * limit < docs.length,
                        page,
                        limit,
                    },
                },
            });
        });
        mountWithProviders(
            <AppLayout>
                <Splash />
            </AppLayout>,
            {
                route: "/",
                setup: (win) =>
                    win.localStorage.setItem(
                        "endpoints.urls",
                        JSON.stringify([
                            { value: MAIN_SERVER_URL, name: "Main", enabled: true },
                            { value: COOP_SERVER_URL, name: "Coop", enabled: true },
                        ]),
                    ),
            },
        );
        cy.get('[data-section="posts-top"] .ant-list-item-meta-title a')
            .first()
            .should("have.text", "Coop leading post");
        cy.scrollTo("bottom");
        cy.wait("@postPage2");
        cy.get('[data-section="posts-rest"]').contains("Main post 23").should("exist");
        cy.get('[data-section^="posts-"] .ant-list-item-meta-title a').should(($links) => {
            const urls = $links.toArray().map((link) => link.getAttribute("href"));
            expect(new Set(urls).size).to.equal(25);
            expect(urls).to.have.length(25);
        });
    });
});
