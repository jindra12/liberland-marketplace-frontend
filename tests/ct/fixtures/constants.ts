import walletMockConfig from "../../../playwright.wallet-mocks.json";

export const PLAYWRIGHT_ROUTE_PATH = walletMockConfig.routePath;

export const FRONTEND_PORT = walletMockConfig.frontendPort;
export const PLAYWRIGHT_BASE_URL = `http://127.0.0.1:${FRONTEND_PORT}`;

export const SOLANA_RPC_PORT = walletMockConfig.solanaRpcPort;
export const SOLANA_RPC_URL = `http://127.0.0.1:${SOLANA_RPC_PORT}`;

export const TRON_RPC_PORT = walletMockConfig.tronRpcPort;
export const TRON_RPC_URL = `http://127.0.0.1:${TRON_RPC_PORT}`;

export const SYNDICATION_SERVERS = walletMockConfig.syndicationServers.map((server) => ({
    ...server,
    url: `http://127.0.0.1:${server.port}`,
}));

export const EVM_WALLET_MOCK = walletMockConfig.wallets.evm;
export const SOLANA_WALLET_MOCK = walletMockConfig.wallets.solana;
export const TRON_WALLET_MOCK = walletMockConfig.wallets.tron;
