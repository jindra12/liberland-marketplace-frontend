import { ZeroAddress, parseEther } from "ethers";

import { TradeForm } from "../../src/components/VentureContracts/TradeForm";
import { LiquidityControls } from "../../src/components/VentureContracts/LiquidityControls";
import { fillFormField, selectFormOption, screenshotStep } from "../support/component-tests/directBasic";
import { mountVentureMarket, quoteVentureTrade, venturePool } from "../support/ventureMarket";
import { savedDeployment } from "../support/ventureContracts";

describe("Venture token exchange", () => {
    it("provides our liquidity form on mainnet and waits for indexed pools on test networks", () => {
        mountVentureMarket(<LiquidityControls deployment={{ ...savedDeployment, chainId: "1" }} pool={venturePool} />);
        cy.contains("Maximum ETH deposit").should("be.visible");
        cy.contains("Maximum token deposit").should("be.visible");
        cy.contains("button", "Connect wallet to manage liquidity").should("be.disabled");
        cy.contains("Add liquidity on Uniswap").should("not.exist");
        cy.contains(savedDeployment.tokenAddress!).should("be.visible");
        screenshotStep("venture-liquidity-controls");
        mountVentureMarket(<LiquidityControls deployment={{ ...savedDeployment, chainId: "31337" }} />);
        cy.contains("Liquidity pool is not available yet").should("be.visible");
        cy.contains("Add liquidity on Uniswap").should("not.exist");
    });
    it("disables a retained quote if its background refresh fails", () => {
        cy.clock(Date.now(), ["setInterval", "clearInterval"]);
        const trade = cy.stub().resolves("0xtrade");
        const quote = cy.stub().callsFake(quoteVentureTrade);
        cy.wrap(trade).as("trade");
        mountVentureMarket(
            <TradeForm
                marketKey="test-market"
                pool={venturePool}
                tokenAddress={savedDeployment.tokenAddress!}
                connected
                onQuote={quote}
                onTrade={trade}
            />,
        );
        fillFormField("You pay (ETH)", "1");
        cy.contains("Minimum receive: 1990.0 HBR").should("be.visible");
        cy.then(() =>
            quote.callsFake(async () => {
                throw new Error("Quote refresh unavailable");
            }),
        );
        cy.tick(15000);
        cy.contains("Quote refresh unavailable").should("be.visible");
        cy.contains("button", "Buy tokens").should("be.disabled");
        cy.get("@trade").should("not.have.been.called");
    });
    it("shows a live rate and slippage minimum, and submits both buy and sell quotes", () => {
        const trade = cy.stub().resolves("0xconfirmed-trade");
        cy.wrap(trade).as("trade");
        mountVentureMarket(
            <TradeForm
                marketKey="test-market"
                pool={venturePool}
                tokenAddress={savedDeployment.tokenAddress!}
                connected
                onQuote={quoteVentureTrade}
                onTrade={trade}
            />,
        );
        fillFormField("You pay (ETH)", "1");
        cy.contains("Rate: 1 ETH = 2000.0 HBR").should("be.visible");
        cy.contains("Minimum receive: 1990.0 HBR").should("be.visible");
        cy.contains("DAO router fee: 0.25%").should("be.visible");
        screenshotStep("venture-exchange-buy");
        cy.contains("button", "Buy tokens").should("be.enabled").click();
        cy.get("@trade").should("have.been.calledOnce");
        cy.then(() => {
            expect(trade.firstCall.args[0]).to.include({
                amountIn: parseEther("1"),
                minimumOut: parseEther("1990"),
                zeroForOne: true,
            });
        });
        selectFormOption("Trade direction", "Sell venture tokens");
        fillFormField("You pay (HBR)", "2000");
        cy.contains("Minimum receive: 0.995 ETH").should("be.visible");
        cy.contains("button", "Sell tokens").should("be.enabled").click();
        cy.get("@trade").should("have.been.calledTwice");
        cy.get(".VentureContracts__confirmedTrade").should("be.visible").and("have.css", "margin-bottom", "22px");
        cy.then(() => expect(trade.secondCall.args[0]).to.include({ amountIn: parseEther("2000"), zeroForOne: false }));
        cy.viewport(390, 844);
        screenshotStep("venture-exchange-mobile");
        cy.document().then((document) => expect(document.documentElement.scrollWidth).to.be.at.most(390));
    });

    it("never submits a stale quote after invalid input or a quote error", () => {
        const trade = cy.stub().resolves("0xtrade");
        const quote = cy.stub().callsFake(quoteVentureTrade);
        cy.wrap(trade).as("trade");
        mountVentureMarket(
            <TradeForm
                marketKey="test-market"
                pool={venturePool}
                tokenAddress={savedDeployment.tokenAddress!}
                connected
                onQuote={quote}
                onTrade={trade}
            />,
        );
        fillFormField("You pay (ETH)", "1");
        cy.contains("Minimum receive: 1990.0 HBR").should("be.visible");
        fillFormField("You pay (ETH)", "-1");
        cy.contains("button", "Buy tokens").should("be.disabled");
        cy.contains("Minimum receive:").should("not.exist");
        cy.then(() =>
            quote.callsFake(async () => {
                throw new Error("Pool has insufficient liquidity");
            }),
        );
        fillFormField("You pay (ETH)", "2");
        cy.contains("Pool has insufficient liquidity").should("be.visible");
        cy.contains("button", "Buy tokens").should("be.disabled");
        cy.get("@trade").should("not.have.been.called");
    });

    it("lets anonymous users inspect rates but not send a trade", () => {
        const trade = cy.stub().resolves("0xtrade");
        mountVentureMarket(
            <TradeForm
                marketKey="test-market"
                pool={venturePool}
                tokenAddress={savedDeployment.tokenAddress!}
                connected={false}
                onQuote={quoteVentureTrade}
                onTrade={trade}
            />,
        );
        fillFormField("You pay (ETH)", "1");
        cy.contains("Estimated receive (HBR)").should("be.visible");
        cy.contains("button", "Buy tokens").should("be.disabled");
        expect(venturePool.currency0.address).to.equal(ZeroAddress);
    });
});
