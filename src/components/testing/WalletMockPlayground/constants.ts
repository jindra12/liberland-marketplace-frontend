import walletMockConfig from "../../../../playwright.wallet-mocks.json";

export const PLAYWRIGHT_TEST_ROUTE_ENABLED = process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST_ROUTE === "true";

export const SOLANA_RPC_URL =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_SOLANA_RPC_URL || `http://127.0.0.1:${walletMockConfig.solanaRpcPort}`;

export const TRON_RPC_URL =
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TRON_RPC_URL || `http://127.0.0.1:${walletMockConfig.tronRpcPort}`;

export const EVM_WALLET_MOCK = walletMockConfig.wallets.evm;
export const SOLANA_WALLET_MOCK = walletMockConfig.wallets.solana;
export const TRON_WALLET_MOCK = walletMockConfig.wallets.tron;
