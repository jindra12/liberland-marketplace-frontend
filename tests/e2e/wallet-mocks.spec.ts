import {
    EVM_WALLET_MOCK,
    PLAYWRIGHT_ROUTE_PATH,
    SOLANA_RPC_URL,
    SOLANA_WALLET_MOCK,
    TRON_RPC_URL,
    TRON_WALLET_MOCK,
} from "./fixtures/constants";
import { expect, test } from "./fixtures/test";

test.beforeEach(async ({ page, network }) => {
    await page.goto(PLAYWRIGHT_ROUTE_PATH);
    expect(network.requests.some((request) => request.url.includes(PLAYWRIGHT_ROUTE_PATH))).toBeTruthy();
});

test.beforeEach(async ({ request }) => {
    await request.post(`${SOLANA_RPC_URL}/__admin/reset`);
    await request.post(`${TRON_RPC_URL}/__admin/reset`);
});

test("sends native ETH through the MetaMask mock", async ({ page, network }) => {
    await page.getByRole("button", { name: "Connect MetaMask mock" }).click();
    await expect(page.getByTestId("evm-address")).toContainText(EVM_WALLET_MOCK.sender);

    await page.getByRole("button", { name: "Send 0.1 ETH" }).click();
    await expect(page.getByTestId("evm-tx")).not.toContainText("n/a");
    await expect(page.getByTestId("evm-recipient-balance")).toContainText("0.6000");
    expect(network.requests.some((request) => request.url.includes(PLAYWRIGHT_ROUTE_PATH))).toBeTruthy();
});

test("sends native SOL through the Solana mock", async ({ page, network }) => {
    await page.getByRole("button", { name: "Connect Solana mock" }).click();
    await expect(page.getByTestId("solana-address")).toContainText(SOLANA_WALLET_MOCK.sender);

    await page.getByRole("button", { name: "Send 0.25 SOL via @solana/pay" }).click();
    await expect(page.getByTestId("solana-signature")).toContainText("solana-mock-signature");
    await expect(page.getByTestId("solana-recipient-balance")).toContainText("0.7500");
    expect(network.requests.some((request) => request.url.startsWith(SOLANA_RPC_URL))).toBeTruthy();
});

test("sends native TRON through the TronLink mock", async ({ page, network }) => {
    await page.getByRole("button", { name: "Connect TronLink mock" }).click();
    await expect(page.getByTestId("tron-address")).toContainText(TRON_WALLET_MOCK.sender);

    await page.getByRole("button", { name: "Send 250000 SUN via tronweb" }).click();
    await expect(page.getByTestId("tron-tx")).not.toContainText("n/a");
    await expect(page.getByTestId("tron-recipient-balance")).toContainText("0.7500");
    expect(network.requests.some((request) => request.url.startsWith(TRON_RPC_URL))).toBeTruthy();
});
