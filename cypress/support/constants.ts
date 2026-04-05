import walletMockConfig from "../../wallet-mocks.json";

export const FRONTEND_PORT = walletMockConfig.frontendPort;
export const ROUTE_PATH = walletMockConfig.routePath;

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

export const DEFAULT_MARKETPLACE_ENDPOINTS = [
    {
        enabled: true,
        name: "Main",
        value: `http://127.0.0.1:4102`,
    },
    {
        enabled: true,
        name: "Alpha Mock Market",
        value: `http://127.0.0.1:4101`,
    },
];
