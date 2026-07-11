import { buildGraphQLAlias } from "../support/graphqlMock/alias";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountProfileRoute, screenshotStep, waitForMeUserQuery } from "../support/component-tests/utils";

const REQUEST_REASON = "Please send me a copy of my account information.";
const CREATE_INFORMATION_REQUEST_VARIABLES = {
    data: {
        reason: REQUEST_REASON,
    },
};
const CREATE_INFORMATION_REQUEST_ALIAS = buildGraphQLAlias(
    MAIN_SERVER_URL,
    "CreateInformationRequest",
    CREATE_INFORMATION_REQUEST_VARIABLES,
);

describe("profile information request", () => {
    it("opens the request form, submits it, and shows success", () => {
        cy.viewport(1440, 1200);
        cy.resetQL();
        cy.clearLocalStorage();

        mountProfileRoute([MAIN_SERVER_URL]);
        waitForMeUserQuery(MAIN_SERVER_URL, "Nova Rivers");

        cy.contains(".Profile__actions", "Request information").scrollIntoView();
        cy.contains(".Profile__actions button", "Request information").should("be.visible");
        screenshotStep("profile-information-request-button", "viewport");

        cy.contains(".Profile__actions button", "Request information").click();
        cy.contains(".ant-modal", "Request information", { timeout: 20000 }).should("be.visible");
        cy.get(".ant-modal-content", { timeout: 20000 }).should("be.visible").screenshot(
            `${Cypress.spec.name} profile information request modal`.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        );

        cy.get(".ant-modal").within(() => {
            cy.get("textarea").should("be.visible").clear({ force: true }).type(REQUEST_REASON, { force: true });
            cy.contains("button", "Send request").should("be.visible").click();
        });

        cy.wait(`@${CREATE_INFORMATION_REQUEST_ALIAS}`, { timeout: 20000 }).then((interception) => {
            expect(interception.request.url).to.equal(`${MAIN_SERVER_URL}/api/graphql`);
            expect(interception.response?.statusCode).to.equal(200);
            expect(interception.request.body.variables).to.deep.equal(CREATE_INFORMATION_REQUEST_VARIABLES);
        });

        cy.contains("Your request has been sent", { timeout: 20000 }).should("be.visible");
        cy.get(".ant-modal").should("not.exist");
    });
});
