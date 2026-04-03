import http from "node:http";

import type { JsonValue, WalletMocksConfig } from "./types";
import { loadJson, parseCliArgs, readJsonBody, sendJson } from "./utils";

const args = parseCliArgs(process.argv.slice(2));
const port = Number(args.port);
const config = loadJson<WalletMocksConfig>(new URL("../../../playwright.wallet-mocks.json", import.meta.url));
const solanaConfig = config.wallets.solana;

const SYSTEM_PROGRAM_ID = "11111111111111111111111111111111";
const BLOCKHASH = "EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k";
const balances = new Map([
    [solanaConfig.sender, solanaConfig.initialSenderLamports],
    [solanaConfig.recipient, solanaConfig.initialRecipientLamports],
]);
let signatureCounter = 0;

type SolanaRpcRequest = {
    id?: JsonValue;
    method?: string;
    params?: JsonValue[];
};

type SolanaTransferRequest = {
    from: string;
    lamports: number;
    to: string;
};

const toStringParam = (value: JsonValue | undefined): string | undefined => {
    return typeof value === "string" ? value : undefined;
};

const rpcResult = (id: JsonValue | null, result: JsonValue) => ({
    jsonrpc: "2.0",
    id,
    result,
});

const rpcError = (id: JsonValue | null, message: string) => ({
    jsonrpc: "2.0",
    id,
    error: {
        code: -32000,
        message,
    },
});

const accountInfo = (address?: string) => {
    if (!address || !balances.has(address)) {
        return null;
    }

    return {
        data: ["", "base64"],
        executable: false,
        lamports: balances.get(address) ?? 0,
        owner: SYSTEM_PROGRAM_ID,
        rentEpoch: 0,
        space: 0,
    };
};

const server = http.createServer(async (request, response) => {
    if (request.method === "OPTIONS") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "GET" && request.url === "/healthz") {
        sendJson(response, 200, { ok: true });
        return;
    }

    if (request.method === "GET" && request.url === "/__state") {
        sendJson(response, 200, {
            sender: balances.get(solanaConfig.sender),
            recipient: balances.get(solanaConfig.recipient),
        });
        return;
    }

    if (request.method !== "POST" || request.url !== "/") {
        sendJson(response, 404, { error: "Not found" });
        return;
    }

    const body = await readJsonBody<SolanaRpcRequest>(request);
    const id = body.id ?? null;

    if (body.method === "getAccountInfo") {
        sendJson(
            response,
            200,
            rpcResult(id, {
                context: { slot: 1 },
                value: accountInfo(toStringParam(body.params?.[0])),
            }),
        );
        return;
    }

    if (body.method === "getBalance") {
        sendJson(
            response,
            200,
            rpcResult(id, {
                context: { slot: 1 },
                value: balances.get(toStringParam(body.params?.[0]) ?? "") ?? 0,
            }),
        );
        return;
    }

    if (body.method === "getRecentBlockhash") {
        sendJson(
            response,
            200,
            rpcResult(id, {
                context: { slot: 1 },
                value: {
                    blockhash: BLOCKHASH,
                    feeCalculator: {
                        lamportsPerSignature: 5000,
                    },
                },
            }),
        );
        return;
    }

    if (body.method === "getLatestBlockhash") {
        sendJson(
            response,
            200,
            rpcResult(id, {
                context: { slot: 1 },
                value: {
                    blockhash: BLOCKHASH,
                    lastValidBlockHeight: 999999,
                },
            }),
        );
        return;
    }

    if (body.method === "mockApplySystemTransfer") {
        const transfer = body.params?.[0] as SolanaTransferRequest;
        const fromBalance = balances.get(transfer.from) ?? 0;
        if (fromBalance < transfer.lamports) {
            sendJson(response, 200, rpcError(id, "insufficient funds"));
            return;
        }

        balances.set(transfer.from, fromBalance - transfer.lamports);
        balances.set(transfer.to, (balances.get(transfer.to) ?? 0) + transfer.lamports);
        signatureCounter += 1;
        sendJson(response, 200, rpcResult(id, `solana-mock-signature-${signatureCounter}`));
        return;
    }

    sendJson(response, 200, rpcError(id, `Unsupported Solana RPC method: ${body.method}`));
});

server.listen(port, "127.0.0.1");
