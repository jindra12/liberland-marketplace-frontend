import { mountMainRoute } from "../support/component-tests/utils";

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

                cy.contains(".SyndicateModal__title", title, { timeout: 20000 }).should("exist");
                cy.wait(150);
                cy.get(".SyndicateModal .ant-modal-content")
                    .should("exist")
                    .screenshot(`${Cypress.spec.name} ${prefix} page ${index + 1}`.replace(/[^a-zA-Z0-9]+/g, "-"));
            });

            cy.contains(".SyndicateModal__footer button", "Browse web").should("be.visible");
            cy.contains(".SyndicateModal__pageCount", "Page 8 of 8").should("be.visible");
        };

        cy.viewport(1280, 900);
        mountMainRoute("/syndicate");
        capturePages("syndicate-desktop");

        cy.viewport(390, 844);
        mountMainRoute("/syndicate");
        capturePages("syndicate-mobile");
    });
});
