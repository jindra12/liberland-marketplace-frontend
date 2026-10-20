import { StartupDetailContent } from "../../src/components/detail/startupDetail/StartupDetailContent";
import type { StartupDetailEntity } from "../../src/components/detail/startupDetail/types";
import { MAIN_SERVER_URL } from "../support/component-tests/constants";
import { mountWithProviders, screenshotStep } from "../support/component-tests/directBasic";
import { emptyVenture, savedDeployment } from "../support/ventureContracts";
import { venturePool } from "../support/ventureMarket";
import { MarketplaceDaoClient } from "@liberland/marketplace-contracts/client/governance";

const venture: StartupDetailEntity = {
    ...emptyVenture,
    description:
        "A community-owned harbor venture. Trade HBR, root tokens for governance, and support its liquidity pool.",
    company: { id: "company-harbor", name: "Harbor Labs", serverURL: MAIN_SERVER_URL },
    contractDeployments: [savedDeployment],
};

describe("Venture detail token integration", () => {
    it("shows persisted token contracts alongside the Venture pitch on desktop and mobile", () => {
        mountWithProviders(
            <StartupDetailContent startup={venture} startupId={venture.id} serverURL={MAIN_SERVER_URL} />,
        );
        cy.contains("h1", "Harbor Venture").should("be.visible");
        cy.contains("Harbor Labs").should("be.visible");
        cy.contains("A community-owned harbor venture.").should("be.visible");
        cy.get(".VentureContracts").within(() => {
            cy.contains("Venture token").should("be.visible");
            cy.contains("21,000,000").should("be.visible");
            cy.get(`a[href="https://etherscan.io/address/${savedDeployment.tokenAddress}"]`).should("be.visible");
            cy.get('[role="tablist"]').should("not.exist");
            cy.get(".VentureContracts__connect").should("have.css", "width", "180px");
        });
        screenshotStep("venture-detail-token-desktop");
        cy.viewport(390, 844);
        cy.contains("h1", "Harbor Venture").should("be.visible");
        cy.get(".EntityDetail__tabs .ant-tabs-nav-list").should("have.css", "flex-wrap", "nowrap");
        screenshotStep("venture-detail-token-mobile");
        cy.document().then((document) => expect(document.documentElement.scrollWidth).to.be.at.most(390));
    });

    it("opens the in-app exchange and liquidity form from the Venture detail page", () => {
        cy.intercept("GET", "**/api/startups/venture-harbor/contract-index*", {
            pools: [venturePool],
            proposals: [],
            hasMore: false,
        }).as("contractIndex");
        mountWithProviders(
            <StartupDetailContent startup={venture} startupId={venture.id} serverURL={MAIN_SERVER_URL} />,
        );
        cy.get(".EntityDetail__tabs").contains('[role="tab"]', "Exchange / buy / sell").click();
        cy.wait("@contractIndex");
        cy.contains("Exchange rates & trading").should("be.visible");
        cy.contains("Maximum ETH deposit").should("not.exist");
        cy.get(".VentureContracts").find('[role="tablist"]').should("not.exist");
        screenshotStep("venture-detail-exchange-desktop");
        cy.get(".EntityDetail__tabs").contains('[role="tab"]', "Liquidity").click();
        cy.contains("Maximum ETH deposit").should("be.visible");
        cy.contains("Maximum token deposit").should("be.visible");
        cy.contains("button", "Connect wallet to manage liquidity").should("be.disabled");
        cy.get('a[href*="app.uniswap.org"]').should("not.exist");
        cy.get(".VentureContracts__form").each(($form) => expect($form.width()).to.be.at.most(760));
        screenshotStep("venture-detail-liquidity-desktop");
        cy.viewport(390, 844);
        screenshotStep("venture-detail-liquidity-mobile");
        cy.document().then((document) => expect(document.documentElement.scrollWidth).to.be.at.most(390));
    });

    it("opens balances and DAO as peer tabs without nested navigation", () => {
        cy.stub(MarketplaceDaoClient.prototype, "listProposals").resolves({ items: [], nextBlock: null });
        cy.stub(MarketplaceDaoClient.prototype, "settings").resolves({
            votingDelay: 86400n,
            votingPeriod: 604800n,
            proposalThreshold: 0n,
            quorumNumerator: 4n,
            quorumDenominator: 100n,
        });
        cy.intercept("GET", "**/api/startups/venture-harbor/contract-index*", {
            pools: [],
            proposals: [],
            hasMore: false,
        }).as("contractIndex");
        mountWithProviders(
            <StartupDetailContent startup={venture} startupId={venture.id} serverURL={MAIN_SERVER_URL} />,
        );
        cy.get(".EntityDetail__tabs").contains('[role="tab"]', "Balances & rewards").click();
        cy.contains("Connect your wallet to see balances and rewards.").should("be.visible");
        cy.get(".VentureContracts").find('[role="tablist"]').should("not.exist");
        screenshotStep("venture-detail-balances");
        cy.get(".EntityDetail__tabs").contains('[role="tab"]', "DAO proposals & voting").click();
        cy.wait("@contractIndex");
        cy.contains("No DAO proposals have been indexed yet.").should("be.visible");
        cy.get(".VentureContracts").find('[role="tablist"]').should("not.exist");
        screenshotStep("venture-detail-dao");
    });

    it("keeps an undeployed Venture readable without exposing deployment to anonymous visitors", () => {
        mountWithProviders(
            <StartupDetailContent
                startup={{ ...venture, contractDeployments: [] }}
                startupId={venture.id}
                serverURL={MAIN_SERVER_URL}
            />,
        );
        cy.contains("h1", "Harbor Venture").should("be.visible");
        cy.contains("This Venture has no deployed token yet.").should("be.visible");
        cy.contains("Deploy on Ethereum").should("not.exist");
        screenshotStep("venture-detail-no-token");
    });
});
