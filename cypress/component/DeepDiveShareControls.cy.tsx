import { detailRoute, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute, mountAuthenticatedDetailRoute } from "../support/component-tests/utils";
import { buildGraphQLAlias } from "../support/graphqlMock/alias";

const REPOST_DESCRIPTION = "A quick note with **Markdown**.";

describe("share controls", () => {
    beforeEach(() => {
        cy.resetQL();
        cy.clearLocalStorage();
    });

    it("uses the desktop share layout at 1200px and up", () => {
        cy.viewport(1200, 1200);
        mountAnonymousRoute(detailRoute("/companies", "company-harbor-labs"), [MAIN_SERVER_URL]);
        cy.contains("h1", "Harbor Labs", { timeout: 20000 }).should("be.visible");

        cy.get(".ShareSection").should("be.visible");
        cy.get(".ShareSection--mobile").should("not.exist");
        cy.get(".ShareSection__actions").should("be.visible");
        cy.get(".ShareSection__buttons").should("be.visible");
        cy.get(".ShareSection__iconButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__nativeButton").should("be.visible");
        cy.get(".ShareSection__repostButton").should("be.visible");
        cy.get(".ShareSection__reportButton").should("be.visible");
        cy.get(".ShareSection__reportActions").should("be.visible");
        cy.get(".ShareSection__reportButton").then(($reportButton) => {
            const reportRect = $reportButton[0].getBoundingClientRect();

            cy.get(".ShareSection__repostButton").then(($repostButton) => {
                const repostRect = $repostButton[0].getBoundingClientRect();

                expect(repostRect.right).to.be.lessThan(reportRect.left + 2);
            });

            cy.get(".ShareSection__iconButton")
                .first()
                .then(($iconButton) => {
                    const iconRect = $iconButton[0].getBoundingClientRect();

                    expect(Math.abs(reportRect.width - iconRect.width)).to.be.lessThan(2);
                    expect(Math.abs(reportRect.height - iconRect.height)).to.be.lessThan(2);
                });
        });
    });

    it("uses the mobile share layout below 1200px", () => {
        cy.viewport(767, 1200);
        mountAnonymousRoute(detailRoute("/companies", "company-harbor-labs"), [MAIN_SERVER_URL]);
        cy.contains("h1", "Harbor Labs").should("be.visible");

        cy.get(".ShareSection--mobile").should("be.visible");
        cy.get(".ShareSection__mobileActions").should("be.visible");
        cy.get(".ShareSection__mobileButton").its("length").should("be.greaterThan", 0);
        cy.get(".ShareSection__mobileReportRow").should("be.visible").and("have.css", "justify-content", "flex-end");
        cy.get(".ShareSection__repostButton").should("be.visible");
        cy.get(".ShareSection__reportButton").should("be.visible");
        cy.get(".ShareSection__actions").should("not.exist");
        cy.get(".ShareSection__iconButton").should("not.exist");
    });

    it("opens the repost modal and submits the shareRepost mutation", () => {
        cy.viewport(1200, 1200);
        mountAuthenticatedDetailRoute(detailRoute("/companies", "company-harbor-labs"), [MAIN_SERVER_URL]);
        cy.contains("h1", "Harbor Labs", { timeout: 20000 }).should("be.visible");

        let expectedLink = "";
        cy.window().then((win) => {
            expectedLink = win.location.href;
        });

        cy.get(".ShareSection", { timeout: 20000 })
            .find('button[aria-label="Repost content"]')
            .should("be.visible")
            .and("not.be.disabled")
            .click();
        cy.contains(".ant-modal", "Add your take", { timeout: 20000 }).should("be.visible");
        cy.get(".ant-modal")
            .find("textarea")
            .should("be.visible")
            .clear({ force: true })
            .type(REPOST_DESCRIPTION, { force: true });
        cy.contains(".ant-modal button", "Repost").should("be.visible").click();

        cy.wait(
            `@${buildGraphQLAlias(MAIN_SERVER_URL, "ShareRepost", {
                input: {
                    companyId: null,
                    description: REPOST_DESCRIPTION,
                    link: expectedLink,
                },
            })}`,
            { timeout: 20000 },
        ).then((interception) => {
            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables).to.deep.equal({
                input: {
                    companyId: null,
                    description: REPOST_DESCRIPTION,
                    link: expectedLink,
                },
            });
        });

        cy.contains(".ant-modal", "Add your take").should("not.exist");
    });
});
