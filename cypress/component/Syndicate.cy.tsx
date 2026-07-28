import { COOP_SERVER_URL, MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountAnonymousRoute } from "../support/component-tests/utils";

describe("syndicate modal", () => {
    it("walks through the onboarding pages", () => {
        const pageTitles = [
            "Let’s get your marketplace online",
            "We recommend a Contabo VPS on Ubuntu 24.04 LTS",
            "Download the setup script",
            "Let the script do the setup",
            "Choose a name for your site",
            "Wallet payments are supported if you want them",
            "Start the installer",
            "Open the admin page and finish setup",
        ];

        const capturePages = (prefix: string) => {
            pageTitles.forEach((title, index) => {
                if (index > 0) {
                    cy.contains(".SyndicateModal__footer button", "Next").click();
                }

                cy.contains(".SyndicateModal__title", title).should("exist");
                cy.get(".SyndicateModal .ant-modal-content")
                    .should("exist")
                    .screenshot(`${Cypress.spec.name} ${prefix} page ${index + 1}`.replace(/[^a-zA-Z0-9]+/g, "-"));
            });

            cy.contains(".SyndicateModal__footer button", "Browse web").should("be.visible");
            cy.contains(".SyndicateModal__pageCount", "Page 8 of 8").should("be.visible");
        };

        cy.viewport(1280, 900);
        mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL]);
        capturePages("syndicate-desktop");

        cy.viewport(390, 844);
        mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL]);
        capturePages("syndicate-mobile");
    });

    it("shows direct and dropdown script downloads", () => {
        cy.viewport(1280, 900);
        mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL]);

        cy.contains(".SyndicateModal__downloadButton", "Download the setup script")
            .should("be.visible")
            .and("have.attr", "href", `${MAIN_SERVER_URL}/deploy-space`);
        cy.contains(".SyndicateModal__downloadDropdown").should("not.exist");
        cy.get(".SyndicateModal .ant-modal-content")
            .should("exist")
            .screenshot(`${Cypress.spec.name} syndicate-single-download`.replace(/[^a-zA-Z0-9]+/g, "-"));

        cy.viewport(1280, 900);
        mountAnonymousRoute("/syndicate", [MAIN_SERVER_URL, COOP_SERVER_URL]);

        cy.contains(".SyndicateModal__downloadDropdown", "Download the setup script").should(
            "be.visible",
        );
        cy.get(".SyndicateModal__downloadDropdown").find(".ant-btn-icon-only").click({ force: true });
        cy.contains(".ant-dropdown-menu-item", "Main").should("be.visible");
        cy.contains(".ant-dropdown-menu-item", "Co-op").should("be.visible");
        cy.get(".SyndicateModal .ant-modal-content")
            .should("exist")
            .screenshot(`${Cypress.spec.name} syndicate-dropdown-download`.replace(/[^a-zA-Z0-9]+/g, "-"));
    });
});
